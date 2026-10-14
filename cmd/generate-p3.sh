podman run --rm --network host -v "$PWD:/out:z" registry.fedoraproject.org/fedora:44 bash -euxc '
dnf -y install git golang gpgme-devel libvirt-devel python3-dnf python3-libdnf5 python3-license-expression
git clone https://github.com/osbuild/osbuild /src/osbuild
git -C /src/osbuild checkout 069f8189dc2cb5a347f277d43a648ae531567e84
git -C /src/osbuild apply /out/osbuild-p1.patch
git -C /src/osbuild apply /out/osbuild-p2.patch
git clone https://github.com/osbuild/image-builder /src/image-builder
git -C /src/image-builder checkout eb38eaa858e78a758c717496274cbb5d53d4ee74
git -C /src/image-builder apply /out/image-builder-disk-sha256.patch
git -C /src/image-builder apply /out/image-builder-p3.patch
cd /src/image-builder
go build -buildvcs=false -ldflags "-X main.version=$(git describe --tags --abbrev=0 | sed s/^v//)" -tags "exclude_graphdriver_btrfs containers_image_openpgp" -o /usr/local/bin/image-builder ./cmd/image-builder
printf "#!/bin/sh\nPYTHONPATH=/src/osbuild exec python3 /src/osbuild/tools/osbuild-depsolve-dnf \"\$@\"\n" > /usr/libexec/osbuild-depsolve-dnf
chmod +x /usr/libexec/osbuild-depsolve-dnf
cd /out
image-builder manifest qcow2 --distro fedora-44 --with-sbom --output-dir . > manifest.json
'
jq -c --arg sha "$(printf 'placeholder: not a real disk image' | sha256sum | cut -d' ' -f1)" \
  '(.packages[] | select(.SPDXID == "SPDXRef-image-root")).checksums = [{"algorithm": "SHA256", "checksumValue": $sha}]' \
  fedora-44-generic-qcow2-x86_64.image-os.spdx.json > p3.image-os.spdx.json
cp fedora-44-generic-qcow2-x86_64.buildroot-build.spdx.json p3.buildroot-build.spdx.json
