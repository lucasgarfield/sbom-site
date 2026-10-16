#!/bin/bash
# Runs everything after the warm manifest matrix. Run on the box host (uses podman).
set -x
R=/workspace/depsolve-perf
EXEC="sudo podman exec -w $R ib-v2"
# memory-limited, ptrace-capable container from the same image for the heavy parts
RUN="sudo podman run --rm --memory 4g --memory-swap 4g --cap-add SYS_PTRACE --network host -v /workspace:/workspace:rw -w $R localhost/depsolve-perf-f44:latest"
REQ4=$(ls $R/runs/cap/dnf4/*-2-depsolve-full.request.json | head -1)
REQ5=$(ls $R/runs/cap/dnf5/*-1-depsolve-full.request.json | head -1)

# 1. cold-cache manifests (fresh metadata download every run)
$EXEC python3 bench/run_matrix.py --out runs/cold --cache cold --images generic-qcow2 --variants today,minimal --solvers dnf4,dnf5 --reps 3 > runs/cold.log 2>&1

# 2. Python scaling sweeps
mkdir -p runs/scaling
$RUN python3 bench/py_scaling.py --solver dnf4 --request $REQ4 --out runs/scaling > runs/scaling/py_dnf4.log 2>&1
$RUN python3 bench/py_scaling.py --solver dnf5 --request $REQ5 --out runs/scaling > runs/scaling/py_dnf5.log 2>&1
$RUN python3 bench/py_scaling.py --solver dnf4 --filelists --request $REQ4 --out runs/scaling --sizes 100,1000,10000,all --synthetic 100,1000,10000,all --reps 3 > runs/scaling/py_dnf4_files.log 2>&1

# 3. Go parse benchmarks on the same synthetic payloads
$RUN sh -c "cd image-builder && DEPSOLVE_BENCH_FILES='$R/runs/scaling/synthetic/*.json' go test -run XXX -bench V2Parse -benchtime 1s -count 3 -timeout 3h ./pkg/depsolvednf/" > runs/scaling/go_bench.txt 2>&1
# estimate: same benchmarks with the jsonv2-backed encoding/json (GOEXPERIMENT=jsonv2), dnf4 only
$RUN sh -c "cd image-builder && GOEXPERIMENT=jsonv2 DEPSOLVE_BENCH_FILES='$R/runs/scaling/synthetic/dnf4-full-*.json $R/runs/scaling/synthetic/dnf4-minimal-*.json' go test -run XXX -bench V2Parse -benchtime 1s -count 3 -timeout 3h ./pkg/depsolvednf/" > runs/scaling/go_bench_jsonv2.txt 2>&1

# 4. whole-repo dump and search end to end (Go driver + timed Python depsolver)
mkdir -p runs/dump
for s in dnf4 dnf5; do for lvl in full minimal; do for rep in 0 1 2; do
  for cmd in dump search; do
    $RUN sh -c "OSBUILD_DEPSOLVE_DNF=$R/bench/osbuild-depsolve-dnf-timed OSBUILD_SOLVER_CONFIG=$R/bench/solver-$s.json PERF_PY_TRACE=$R/runs/dump/py.jsonl IMAGE_BUILDER_DEPSOLVE_TRACE=$R/runs/dump/go.jsonl /usr/bin/time -f '%e %M' -a -o $R/runs/dump/time.txt bin/dsbench -cmd $cmd -specs '*' -metadata $lvl -cache $R/cache/warm-$s -tag $s-$lvl-$rep" >> runs/dump/results.jsonl 2>> runs/dump/stderr.txt
  done
done; done; done

# 5. raw pipe throughput (no JSON) on payloads of various sizes
for f in $(ls $R/runs/scaling/synthetic/dnf4-full-*.json $R/runs/scaling/synthetic/dnf5-full-*.json); do for rep in 0 1 2; do
  $RUN bin/dsbench -cmd pipe -pipe-file $f -tag $(basename $f) >> runs/scaling/pipe.jsonl
done; done
echo ALLDONE
