# local registry + placeholder disk image pushed as an OCI artifact (Konflux oci-copy style)
podman run -d --rm --name reg --network host docker.io/library/registry:2
printf 'placeholder: not a real disk image' > disk.qcow2   # placeholder bytes; sha256 = SBOM image root checksum
for repo in raw wrapped; do
  podman run --rm --network host -v "$PWD:/w:z" -w /w ghcr.io/oras-project/oras:v1.2.3 push --plain-http \
    localhost:5000/$repo/fedora-44-qcow2:p3 --artifact-type application/vnd.diskimage.qcow2 \
    disk.qcow2:application/vnd.diskimage.qcow2 --format json > push-$repo.json
done
jq -r .digest push-raw.json push-wrapped.json
