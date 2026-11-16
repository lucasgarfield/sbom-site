# image-builder SBOM MVP: annotated sample for ProdSec

Static site (no build step). Serve the directory over HTTP (`python3 -m http.server`); `file://` blocks the JSON fetch.

- `index.html`: page
- `js/data.js`: field notes, open questions, source links
- `js/app.js`: JSON viewer
- `css/style.css`: styles
- `data/centos-9-qcow2-x86_64.spdx.json`: unmodified output of
  `image-builder build qcow2 --distro centos-9 --with-sbom` built from
  lucasgarfield/image-builder@d87a70fbd71eccf42a1fc1571a2aca0f332e094a (2026-11-16, Fedora 44 VM, osbuild 193).
