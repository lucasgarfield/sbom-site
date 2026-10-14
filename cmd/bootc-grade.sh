# manifest only: no disk is built, so the image root gets a placeholder sha256 (visible step), then sbom-grader + mequal
jq -c --arg sha "$(printf 'placeholder: not a real disk image' | sha256sum | cut -d' ' -f1)" \
  '(.packages[] | select(.SPDXID == "SPDXRef-image-root")).checksums = [{"algorithm": "SHA256", "checksumValue": $sha}]' \
  a/bootc-fedora-44-qcow2-x86_64.image-os.spdx.json > bootc.image-os.spdx.json
python3 -m venv sbom-grader-venv && . sbom-grader-venv/bin/activate
pip install -q git+https://github.com/BorekZnovustvoritel/SBOM-Grader@66e37c8333ac6055a8c34f2578bab0f2e1385087
sbomgrader grade bootc.image-os.spdx.json
# mequal: same bundle build as cmd/mequal-p3.sh, then
opa eval --bundle mequal.tar.gz --input bootc.image-os.spdx.json -f json data.main.full | jq "[.result[0].expressions[].value] | add"
