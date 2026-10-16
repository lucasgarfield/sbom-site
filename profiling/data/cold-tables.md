
#### generic-qcow2 — dnf4 — 704 packages over 2 depsolve calls, 3 reps

| stage (sum over calls), median (min–max) ms | today (cold) | minimal (cold) |
|---|---|---|
| response payload (MB) | 5.91 | 0.36 |
|   of which depsolver SBOM (MB) | 1.43 | 0.00 |
| reldeps / files returned | 53964 | 0 |
| Py interpreter start (before harness) | 141 (129–146) | 132 (129–146) |
| Py import dnf/libdnf5 + tool | 289 (258–377) | 297 (276–304) |
| Py read+parse request | 0 (0–0) | 0 (0–0) |
| Py repo metadata load (solver init) | 5703 (5702–5876) | 6282 (6131–6983) |
| Py depsolve (resolve, minus convert/SBOM) | 1681 (1620–1783) | 1645 (1637–1727) |
| Py dnf pkg -> model.Package | 249 (218–305) | 46 (45–47) |
| Py SPDX SBOM in depsolver | 286 (271–331) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 36 (35–37) | 5 (5–5) |
| Py model.Package -> dict | 59 (56–62) | 0 (0–1) |
| Py json.dumps | 28 (26–29) | 2 (1–2) |
| Py stdout write+flush | 25 (22–52) | 1 (1–2) |
| Py exit/teardown after output | 1 (1–1) | 1 (1–1) |
|   (of repo load: Repo.load md check) | 2894 (2825–3093) | 3532 (3494–4251) |
| Go marshal request | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 58 (51–63) | 6 (5–6) |
| Go convert to rpmmd | 3 (2–3) | 0 (0–1) |
| Go other post-processing (incl. SBOM doc) | 1 (1–1) | 1 (1–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 453 (416–549) | 60 (60–61) |
| depsolver process (Go view) | 8505 (8360–9015) | 8385 (8262–9219) |
| output arrival window (first→last byte) | 37 (36–67) | 2 (1–2) |
| rest of image-builder (not depsolve) | 3009 (2934–3238) | 3087 (2981–3090) |
| **total wall** | 11575 (11349–12319) | 11482 (11249–12314) |
| metadata-dependent share of wall | 3.9% | 0.5% |
| peak RSS Python (MiB, max over calls) | 201 | 192 |
| peak RSS image-builder Go process (MiB) | 88 | 68 |

#### generic-qcow2 — dnf5 — 704 packages over 2 depsolve calls, 3 reps

| stage (sum over calls), median (min–max) ms | today (cold) | minimal (cold) |
|---|---|---|
| response payload (MB) | 14.26 | 8.70 |
|   of which depsolver SBOM (MB) | 1.44 | 0.00 |
| reldeps / files returned | 53964 | 0 |
| Py interpreter start (before harness) | 132 (121–137) | 114 (108–115) |
| Py import dnf/libdnf5 + tool | 242 (232–245) | 243 (218–253) |
| Py read+parse request | 0 (0–0) | 0 (0–13) |
| Py repo metadata load (solver init) | 5569 (5421–5682) | 5420 (5407–5591) |
| Py depsolve (resolve, minus convert/SBOM) | 1278 (1261–1315) | 1258 (1235–1259) |
| Py dnf pkg -> model.Package | 631 (585–648) | 86 (84–87) |
| Py SPDX SBOM in depsolver | 497 (464–501) | 0 (0–0) |
| Py disjoint sets (hash Packages) | 45 (44–45) | 15 (14–16) |
| Py model.Package -> dict | 22 (21–23) | 1 (1–1) |
| Py json.dumps | 54 (53–55) | 25 (22–26) |
| Py stdout write+flush | 50 (49–57) | 26 (24–29) |
| Py exit/teardown after output | 1 (1–1) | 1 (0–1) |
| Go marshal request | 0 (0–0) | 0 (0–0) |
| Go json.Unmarshal | 101 (99–107) | 52 (47–55) |
| Go convert to rpmmd | 3 (2–3) | 0 (0–0) |
| Go other post-processing (incl. SBOM doc) | 1 (1–1) | 1 (1–1) |
| **metadata-dependent stages** (convert+disjoint+dict+dumps+write+unmarshal+convert) | 901 (866–930) | 201 (200–207) |
| depsolver process (Go view) | 8565 (8421–8589) | 7212 (7149–7375) |
| output arrival window (first→last byte) | 76 (64–88) | 36 (34–39) |
| rest of image-builder (not depsolve) | 2952 (2811–2969) | 2973 (2937–2997) |
| **total wall** | 11504 (11493–11627) | 10263 (10133–10403) |
| metadata-dependent share of wall | 7.8% | 2.0% |
| peak RSS Python (MiB, max over calls) | 233 | 207 |
| peak RSS image-builder Go process (MiB) | 110 | 87 |
