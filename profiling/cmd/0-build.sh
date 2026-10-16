# branches (local): osbuild depsolve-package-metadata @ af8acb42, image-builder depsolve-package-metadata @ 58760d43d
git -C osbuild checkout depsolve-package-metadata
git -C image-builder checkout depsolve-package-metadata
(cd image-builder && go build -buildvcs=false -tags "exclude_graphdriver_btrfs containers_image_openpgp" -o ../bin/image-builder ./cmd/image-builder)
(cd bench/go && go build -o ../../bin/dsbench ./dsbench)
(cd osbuild && python3 -m pytest test/mod/test_solver_api_v2.py test/mod/test_solver_implementations.py)
(cd image-builder && go test ./pkg/depsolvednf/ -run 'ParsePackageMetadata|TestV2RequestsCarryPackageMetadata|TestV2ParseMinimal')
