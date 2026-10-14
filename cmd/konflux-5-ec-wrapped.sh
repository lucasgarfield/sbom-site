# attest the mobster-wrapped SBOM on wrapped/ and validate with the same policy
set -e
D=$(jq -r .digest push-wrapped.json)
podman run --rm --user 0 --network host -v $PWD:/w:z -w /w -e COSIGN_PASSWORD= ghcr.io/sigstore/cosign/cosign:v2.4.3 \
  attest --key cosign.key --tlog-upload=false --allow-insecure-registry -y --type spdxjson --predicate wrapped.spdx.json localhost:5000/wrapped/fedora-44-qcow2@$D
podman run --rm --user 0 --network host -v "$PWD:/w:z" -w /w quay.io/conforma/cli:latest validate image \
  --image localhost:5000/wrapped/fedora-44-qcow2@$D --public-key cosign.pub --ignore-rekor \
  --policy policy.yaml --info --show-successes --output text
