podman run --rm --network host -v "$PWD:/out:z" registry.fedoraproject.org/fedora:44 bash -euxc '
dnf -y install git golang gpgme-devel libvirt-devel python3-dnf python3-libdnf5 python3-license-expression
git clone https://github.com/osbuild/osbuild /src/osbuild
git -C /src/osbuild checkout 069f8189dc2cb5a347f277d43a648ae531567e84
git clone https://github.com/osbuild/image-builder /src/image-builder
git -C /src/image-builder checkout eb38eaa858e78a758c717496274cbb5d53d4ee74
cd /src/image-builder
go build -buildvcs=false -tags "exclude_graphdriver_btrfs containers_image_openpgp" -o /usr/local/bin/image-builder ./cmd/image-builder
printf "#!/bin/sh\nPYTHONPATH=/src/osbuild exec python3 /src/osbuild/tools/osbuild-depsolve-dnf \"\$@\"\n" > /usr/libexec/osbuild-depsolve-dnf
chmod +x /usr/libexec/osbuild-depsolve-dnf
cd /out
image-builder manifest qcow2 --distro fedora-44 --with-sbom --output-dir . > manifest.json
'
