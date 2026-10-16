cd image-builder
DEPSOLVE_BENCH_FILES='../runs/scaling/synthetic/*.json' go test -run XXX -bench V2Parse -benchtime 1s -count 3 -timeout 3h ./pkg/depsolvednf/
# estimate only:
GOEXPERIMENT=jsonv2 DEPSOLVE_BENCH_FILES='../runs/scaling/synthetic/dnf4-*.json' go test -run XXX -bench V2Parse -benchtime 1s -count 3 -timeout 3h ./pkg/depsolvednf/
