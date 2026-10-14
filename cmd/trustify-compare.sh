# Trustify 0.3.5, fresh DB: ingest main / patch 3 / wrapped SBOMs + real Red Hat CSAF advisories, query matches
set -e
podman rm -f tpg trustd >/dev/null 2>&1 || true
podman run -d --name tpg --network host -e POSTGRES_PASSWORD=trustify -e POSTGRES_DB=trustify docker.io/library/postgres:17 -p 5433 >/dev/null
until podman exec tpg pg_isready -p 5433 -q; do sleep 1; done; sleep 2
E="-e TRUSTD_DB_HOST=localhost -e TRUSTD_DB_PORT=5433 -e TRUSTD_DB_PASSWORD=trustify -e TRUSTD_DB_NAME=trustify"
podman run --rm --network host $E ghcr.io/trustification/trustd:latest db migrate >/dev/null 2>&1
podman run -d --name trustd --network host $E -e TRUSTD_STORAGE_FS_PATH=/tmp/s ghcr.io/trustification/trustd:latest api --auth-disabled >/dev/null
T='http://[::1]:8080/api/v2'
until curl -gsf "$T/sbom" >/dev/null; do sleep 2; done
# advisories: latest RHSA per package (real Red Hat CSAF)
for p in glibc openssl curl systemd sudo; do
  r=$(curl -s "https://access.redhat.com/hydra/rest/securitydata/csaf.json?package=$p&per_page=1" | jq -r '.[0].RHSA' | tr 'A-Z:' 'a-z_')
  curl -sf -o $r.json https://security.access.redhat.com/data/csaf/v2/advisories/${r#rhsa-}.json 2>/dev/null \
    || curl -sf -o $r.json https://security.access.redhat.com/data/csaf/v2/advisories/$(echo $r | cut -d- -f2 | cut -d_ -f1)/$r.json
  echo "$p  $r  $(jq -r '[.vulnerabilities[].cve]|join(",")' $r.json)  $(curl -gs -XPOST --data-binary @$r.json $T/advisory | jq -c '{id, warnings: (.warnings|length)}')"
done
# control: one glibc purl in Red Hat form, one release before the glibc RHSA's fix
G=$(ls rhsa-*.json | while read f; do jq -e '.document.title|test("glibc")' $f >/dev/null && echo $f; done | head -1)
FIX=$(jq -r '[..|objects|select(has("purl"))|.purl|select(test("^pkg:rpm/redhat/glibc@[^?]*el[0-9]"))|select(test("arch=x86_64"))][0]' $G)
V=$(echo "$FIX" | sed -E 's/.*@([^?]*)\?.*/\1/'); VPREV=$(echo "$V" | awk -F. '{ $NF=$NF-1; print }' OFS=.)
jq --arg p "pkg:rpm/redhat/glibc@$VPREV?arch=x86_64" --arg v "$VPREV" '
  .name="control-redhat-purl" | .documentNamespace+="-control"
  | (.packages[]|select(.name=="glibc")) |= (.versionInfo=$v | .externalRefs=[{referenceCategory:"PACKAGE-MANAGER",referenceType:"purl",referenceLocator:$p}])' p3.image-os.spdx.json > control.spdx.json
echo "control: glibc purl pkg:rpm/redhat/glibc@$VPREV?arch=x86_64 (fixed in $V)"
for f in main.image-os p3.image-os wrapped control; do
  id=$(curl -gs -XPOST -H 'content-type: application/json' --data-binary @$f.spdx.json $T/sbom | tee ing-$f.json | jq -r .id)
  curl -gs "$T/sbom/$id" > s-$f.json; curl -gs "$T/sbom/$id/advisory" > a-$f.json
  jq '{purls: [.packages[].externalRefs[]? | select(.referenceType=="purl") | .referenceLocator] | unique}' $f.spdx.json > p-$f.json
  curl -gs -XPOST -H 'content-type: application/json' --data-binary @p-$f.json $T/vulnerability/analyze > v-$f.json
  jq -nc --arg f $f --slurpfile s s-$f.json --slurpfile a a-$f.json --slurpfile i ing-$f.json --slurpfile p p-$f.json --slurpfile v v-$f.json \
    '{sbom:$f, packages:$s[0].number_of_packages, ingest_warnings:($i[0].warnings|length), "sbom/{id}/advisory":($a[0]|length),
      purls:($p[0].purls|length), "analyze: purls with CVEs":([$v[0]|to_entries[]|select(.value.details|length>0)]|length),
      cves:([$v[0][].details[]?.identifier]|unique)}'
done
