# image-builder (p3 + bootc SBOM prototype) on quay.io/coreos-devel/fedora-coreos:rawhide, manifest only
# needs: image-builder-disk-sha256.patch, image-builder-p3.patch, image-builder-bootc-sbom.patch in $PWD
podman run --rm --privileged --network host -v "$PWD:/out:z" registry.fedoraproject.org/fedora:44 bash -euc '
dnf -y -q install git golang gpgme-devel libvirt-devel podman skopeo jq >/dev/null
git clone -q https://github.com/osbuild/image-builder /src/image-builder
cd /src/image-builder
git checkout -q eb38eaa858e78a758c717496274cbb5d53d4ee74
for p in disk-sha256 p3 bootc-sbom; do git apply /out/image-builder-$p.patch; done
go build -buildvcs=false -ldflags "-X main.version=$(git describe --tags --abbrev=0 | sed s/^v//)" \
  -tags "exclude_graphdriver_btrfs containers_image_openpgp" -o /usr/local/bin/image-builder ./cmd/image-builder
REF=quay.io/coreos-devel/fedora-coreos:rawhide
podman pull -q $REF >/dev/null
cd /out && rm -rf a b c && mkdir a b c
echo "\$ image-builder manifest qcow2 --bootc-ref $REF --with-sbom   # registry lookup"
image-builder manifest qcow2 --bootc-ref $REF --with-sbom --output-dir a 2>&1 >a/manifest.json | grep -E "SBOM|WARNING|rror" || true
echo "\$ … --bootc-ref-sbom quay.io/coreos-devel/fedora-coreos:sha256-<index>.sbom   # override: registry ref"
image-builder manifest qcow2 --bootc-ref $REF --with-sbom --output-dir b \
  --bootc-ref-sbom quay.io/coreos-devel/fedora-coreos:sha256-$(skopeo inspect --raw docker://$REF 2>/dev/null | sha256sum | cut -d" " -f1).sbom 2>&1 >b/manifest.json | grep -E "SBOM|WARNING|rror" || true
echo "\$ image-builder manifest bootc-installer --bootc-ref $REF --bootc-installer-payload-ref $REF --bootc-payload-ref-sbom a/*.bootc-ref.spdx.json   # override: file"
image-builder manifest bootc-installer --bootc-ref $REF --bootc-installer-payload-ref $REF --with-sbom --output-dir c \
  --bootc-payload-ref-sbom $(ls a/*.bootc-ref.spdx.json) 2>&1 >c/manifest.json | grep -E "SBOM|WARNING|rror" || true
ls a b c
'
