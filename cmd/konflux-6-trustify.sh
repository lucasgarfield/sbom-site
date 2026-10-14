# Trustify 0.3.5 (trustd) + postgres, auth disabled, local only; ingest raw + wrapped SBOMs
set -e
podman rm -f tpg trustd >/dev/null 2>&1 || true
podman run -d --name tpg --network host -e POSTGRES_PASSWORD=trustify -e POSTGRES_DB=trustify docker.io/library/postgres:17 -p 5433 >/dev/null
until podman exec tpg pg_isready -p 5433 -q; do sleep 1; done; sleep 2
E="-e TRUSTD_DB_HOST=localhost -e TRUSTD_DB_PORT=5433 -e TRUSTD_DB_PASSWORD=trustify -e TRUSTD_DB_NAME=trustify"
podman run --rm --network host $E ghcr.io/trustification/trustd:latest db migrate >/dev/null 2>&1
podman run -d --name trustd --network host $E -e AUTH_DISABLED=true -e TRUSTD_STORAGE_FS_PATH=/tmp/s \
  ghcr.io/trustification/trustd:latest api --auth-disabled >/dev/null
until curl -gsf [::1]:8080/.well-known/trustify >/dev/null; do sleep 2; done
for f in p3.image-os wrapped; do
  echo "\$ POST /api/v2/sbom  $f.spdx.json"
  curl -gs -XPOST -H 'content-type: application/json' --data-binary @$f.spdx.json [::1]:8080/api/v2/sbom | tee tr-$f.id.json; echo
done
