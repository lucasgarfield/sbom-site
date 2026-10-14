# control: same SBOM, name = repo@<file sha256 from the SBOM root> (what image-builder knows), on its own repo
set -e
FILE=$(sha256sum disk.qcow2 | cut -d' ' -f1)   # = SBOM image root SHA256 (placeholder)
podman run --rm --network host -v "$PWD:/w:z" -w /w ghcr.io/oras-project/oras:v1.2.3 push --plain-http \
  --artifact-type application/vnd.diskimage.qcow2 --format json localhost:5000/control/fedora-44-qcow2:p3 disk.qcow2 > push-control.json
D=$(jq -r .digest push-control.json)
jq --arg n "localhost:5000/control/fedora-44-qcow2@sha256:$FILE" '.name=$n' p3.image-os.spdx.json > control.spdx.json
C="podman run --rm --user 0 --network host -v $PWD:/w:z -w /w -e COSIGN_PASSWORD= ghcr.io/sigstore/cosign/cosign:v2.4.3"
$C sign --key cosign.key --tlog-upload=false --allow-insecure-registry -y localhost:5000/control/fedora-44-qcow2@$D
$C attest --key cosign.key --tlog-upload=false --allow-insecure-registry -y --type spdxjson --predicate control.spdx.json localhost:5000/control/fedora-44-qcow2@$D
podman run --rm --user 0 --network host -v "$PWD:/w:z" -w /w quay.io/conforma/cli:latest validate image \
  --image localhost:5000/control/fedora-44-qcow2@$D --public-key cosign.pub --ignore-rekor \
  --policy policy.yaml --info --show-successes --output text
