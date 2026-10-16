#!/bin/bash
# cProfile + py-spy of the depsolver for the largest image (workstation-live-installer, full metadata),
# and pprof of image-builder. Run on the box host after the other benchmarks.
set -x
R=/workspace/depsolve-perf
RUN="sudo podman run --rm --memory 4g --cap-add SYS_PTRACE --network host -v /workspace:/workspace:rw -w $R localhost/depsolve-perf-f44:latest"
mkdir -p $R/runs/profiles
for s in dnf4 dnf5; do
  # capture the requests of the workstation manifest
  rm -rf $R/runs/profiles/cap-$s; mkdir -p $R/runs/profiles/cap-$s
  $RUN sh -c "OSBUILD_DEPSOLVE_DNF=$R/bench/osbuild-depsolve-dnf-plain OSBUILD_SOLVER_CONFIG=$R/bench/solver-$s.json IMAGE_BUILDER_EXPERIMENTAL=depsolve-no-sbom IMAGE_BUILDER_DEPSOLVE_CAPTURE=$R/runs/profiles/cap-$s IMAGE_BUILDER_CPUPROFILE=$R/runs/profiles/ib-workstation-$s.cpu.pprof bin/image-builder manifest workstation-live-installer --distro fedora-44 --rpmmd-cache $R/cache/warm-$s > /dev/null"
  big=$(ls -S $R/runs/profiles/cap-$s/*.response.json | head -1); req=${big%.response.json}.request.json
  $RUN sh -c "OSBUILD_SOLVER_CONFIG=$R/bench/solver-$s.json PERF_PY_CPROFILE=$R/runs/profiles/py-workstation-$s.pstats bench/osbuild-depsolve-dnf-timed < $req > /dev/null"
  $RUN sh -c "OSBUILD_SOLVER_CONFIG=$R/bench/solver-$s.json PERF_PY_NOTIMERS=1 py-spy record --subprocesses --rate 250 --format speedscope -o $R/runs/profiles/pyspy-workstation-$s.speedscope.json -- bench/osbuild-depsolve-dnf-timed < $req > /dev/null"
  $RUN sh -c "OSBUILD_SOLVER_CONFIG=$R/bench/solver-$s.json PERF_PY_NOTIMERS=1 py-spy record --subprocesses --rate 250 -o $R/runs/profiles/pyspy-workstation-$s.svg -- bench/osbuild-depsolve-dnf-timed < $req > /dev/null"
  $RUN sh -c "python3 -c \"import pstats; pstats.Stats('$R/runs/profiles/py-workstation-$s.pstats').sort_stats('tottime').print_stats(25)\"" > $R/runs/profiles/py-workstation-$s.top.txt
  $RUN sh -c "go tool pprof -top -cum -nodecount=40 bin/image-builder $R/runs/profiles/ib-workstation-$s.cpu.pprof" > $R/runs/profiles/ib-workstation-$s.top.txt 2>&1
done
echo PROFDONE
