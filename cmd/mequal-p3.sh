podman run --rm --network host -v "$PWD:/w:z" -w /w ghcr.io/lucasgarfield/sbom-toolbox:latest bash -euc '
cd $(mktemp -d)
git clone -q https://github.com/sbomer-project/mequal
git -C mequal checkout -q 386a4d05d499674e7c23b9b0b2507a660543beee
git clone -q https://github.com/sbomer-project/mequal-helpers
git -C mequal-helpers checkout -q 273f8c7b2e26935215bf95497da2b80fc499a40a
git clone -q https://github.com/sbomer-project/mequal-prodsec-policies
git -C mequal-prodsec-policies checkout -q d3c38e775c37af6461aa9a59df6a6018c3aa0080
git -C mequal-prodsec-policies apply /w/prodsec-spdx.patch
cd mequal
cp -r ../mequal-helpers/ec policy/ec
cp -r ../mequal-prodsec-policies/policy/prodsec policy/prodsec
mkdir -p binaries policy_annotations
ln -s "$(command -v opa)" binaries/opa-cli
bash scripts/manifest_revision.sh 386a4d0 > /dev/null
for d in policy/*/; do opa inspect -f json -a "$d" > "policy_annotations/inspection_$(basename "$d").json"; done
python3 scripts/generate_bundle_info.py > /dev/null
opa build -b $(ls -d -- ./policy/*/) -o /w/mequal.tar.gz
cd /w
opa eval --bundle mequal.tar.gz --input p3.image-os.spdx.json -f json data.main.full | jq -C "[.result[0].expressions[].value] | add"
'
