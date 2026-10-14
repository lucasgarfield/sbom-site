# Trustify (started as in cmd/trustify-compare.sh): ingest the bootc image SBOM and the container SBOM it references
T='http://[::1]:8080/api/v2'
for f in bootc.image-os.spdx.json a/bootc-fedora-44-qcow2-x86_64.bootc-ref.spdx.json; do
  echo "\$ POST /api/v2/sbom  $(basename $f)"
  r=$(curl -gs -XPOST -H 'content-type: application/json' --data-binary @$f $T/sbom); echo "$r" | jq -c '{warnings}'
  echo "\$ GET /api/v2/sbom/{id} | .number_of_packages"; curl -gs "$T/sbom/$(echo "$r" | jq -r .id)" | jq .number_of_packages
done
