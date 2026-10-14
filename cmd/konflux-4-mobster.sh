# upstream mobster vs Lucas's fork (lucasgarfield/mobster@c24eaf9, branch oci-artifact-from-sbom)
set -e
D=$(jq -r .digest push-wrapped.json)
cat > oci-copy.yaml <<Y
artifact_type: application/vnd.diskimage.qcow2
artifacts:
  - source: https://example.com/fedora-44.qcow2
    filename: disk.qcow2
    type: application/vnd.diskimage.qcow2
    sha256sum: $(sha256sum disk.qcow2 | cut -d' ' -f1)
Y
T="podman run --rm --user 0 --network host -v $PWD:/w:z -w /w ghcr.io/lucasgarfield/sbom-toolbox:latest"
A="generate --output OUT oci-artifact --image-pullspec localhost:5000/wrapped/fedora-44-qcow2:p3 --image-digest $D --oci-copy-yaml oci-copy.yaml --sbom-type spdx"
echo '$ mobster (upstream) … --from-sbom p3.image-os.spdx.json'
$T mobster ${A/OUT/x.json} --from-sbom p3.image-os.spdx.json 2>&1 | tail -2 || true
echo '$ mobster (upstream), no content SBOM'
$T mobster ${A/OUT/upstream.spdx.json} >/dev/null 2>&1
jq '{name, packages:[.packages[]|.name]}' upstream.spdx.json
echo '$ mobster (fork c24eaf9) … --from-sbom p3.image-os.spdx.json --fold-content-root --artifact-purpose FILE'
$T sh -c "pip install -q https://github.com/lucasgarfield/mobster/archive/c24eaf9.tar.gz >/dev/null 2>&1 && mobster ${A/OUT/wrapped.spdx.json} --from-sbom p3.image-os.spdx.json --fold-content-root --artifact-purpose FILE" >/dev/null 2>&1
jq '{name, packages:(.packages|length), root:(.documentDescribes)}' wrapped.spdx.json
