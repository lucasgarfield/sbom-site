# one traced manifest (variant "minimal", dnf5); drop depsolve-package-metadata=minimal for "full", drop depsolve-no-sbom for "today"
OSBUILD_DEPSOLVE_DNF=$PWD/bench/osbuild-depsolve-dnf-timed \
OSBUILD_SOLVER_CONFIG=$PWD/bench/solver-dnf5.json \
IMAGE_BUILDER_EXPERIMENTAL=depsolve-package-metadata=minimal,depsolve-no-sbom \
IMAGE_BUILDER_DEPSOLVE_TRACE=/tmp/go.jsonl PERF_PY_TRACE=/tmp/py.jsonl \
  bin/image-builder manifest generic-qcow2 --distro fedora-44 --rpmmd-cache cache/warm-dnf5 > /dev/null
