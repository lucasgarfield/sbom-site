# throwaway cosign key; sign both artifact refs; attest the raw image-builder SBOM on raw/
C="podman run --rm --user 0 --network host -v $PWD:/w:z -w /w -e COSIGN_PASSWORD= ghcr.io/sigstore/cosign/cosign:v2.4.3"
D=$(jq -r .digest push-raw.json)
$C generate-key-pair
for repo in raw wrapped; do $C sign --key cosign.key --tlog-upload=false -y localhost:5000/$repo/fedora-44-qcow2@$D; done
$C attest --key cosign.key --tlog-upload=false -y --type spdxjson --predicate p3.image-os.spdx.json localhost:5000/raw/fedora-44-qcow2@$D
