# Depsolve metadata transfer cost: osbuild-depsolve-dnf → image-builder

*Lucas Garfield, 2026-10-16. Prototype measurements. Local branches only; nothing was pushed upstream.*

## TL;DR

* **For image builds, the cost is real but modest, and JSON is not where it goes.** Going from minimal to full package metadata adds **0.05–0.5 s with dnf4** and **0.1–1.0 s with dnf5** to a 4–6 s warm `image-builder manifest`. That is 1.6–10 % of wall time with dnf4 and up to 27 % with dnf5.
* **Most of that cost (60–70 %) is the Python dnf → `model.Package` conversion.** It reads every attribute through the DNF bindings and builds and sorts reldep objects. `json.dumps` is about 5–10 %, the pipe write is under 3 % at about 400–700 MB/s, and Go `json.Unmarshal` is about 10–15 %. Go-side conversion is noise.
* **A different wire format would remove only a small part of the cost.** As estimates only (not implemented): msgpack/CBOR payloads are just **~17 % smaller** than JSON, and gzip -1 is **~8.5× smaller**. `GOEXPERIMENT=jsonv2` decodes **~1.6–2× faster**. The Python conversion, the biggest stage, is the same whatever format follows it.
* **Bigger levers than the wire format:**
  1. **dnf5 sends every mirror URL for each package** (~94 per package). This is 62–81 % of the full payload, and it keeps the "minimal" dnf5 payload at 3.5–28 MB.
  2. **The SPDX SBOM built inside the depsolver today** costs 0.12–1.15 s. That is about as much as the whole full-metadata transfer, so moving SBOM generation to Go roughly pays for full metadata.
  3. **`image-builder` time outside the depsolve** is a constant ~2.8–3.1 s per manifest, mostly YAML distro-definition loading. Repo metadata loading takes 0.8–1.3 s with dnf4 (loaded twice) and ~0.3 s with dnf5. Interpreter start plus import is ~0.35 s per depsolver call.
* **Whole-repo `dump`/`search` (76 354 packages) is where full metadata gets expensive:**
  * dnf4 full: 207 MB JSON, dump 10.8 s and search 17.2 s, versus 4.7 s minimal. Search peaks at 1.6 GiB Python RSS.
  * **dnf5 full dump/search was OOM-killed in a 4 GiB container.** Its JSON is ≈1.2 GB, mostly mirror URLs.
  * Even the dnf5 *minimal* dump is 1.0 GB and takes 15.6 s. It needs 3.1 GiB Go RSS, and dnf5 minimal search OOMs too.
* **All stages scale linearly** with the number of packages and with payload bytes. Log-log exponents are 0.97–1.09 for convert, dumps and Go Unmarshal, and 1.1–1.35 for Python dict building and disjoint sets, a mild super-linearity probably caused by GC with many live objects. Nothing is quadratic.

## What was built (Task 1)

### Upstream baseline: full metadata is already the default

On current upstream `main`, the V2 solver API (osbuild 0b13c072, 2025-11-28) **already returns full metadata** for depsolve, dump and search, with both dnf4 and dnf5. This full metadata covers:

* summary, description, license, URL, vendor, packager
* build and install time, size
* source RPM
* checksums
* `requires`/`provides`/`conflicts`/`obsoletes`/weak deps (+ files if `filelists` is requested)

`rpmmd.Package` in image-builder already holds all of these fields (PackageSpec was removed in 88fd7879b), so the Go "consolidation" was already done upstream.

The new request field therefore runs the other way: **`full` stays the default**, which is today's behaviour, and **`minimal` is opt-in**. `minimal` is Achilleas' "only what the manifest needs" option: NEVRA, location, repo id, remote locations and checksum.

| repo | branch | base (upstream main) | commits |
|---|---|---|---|
| osbuild | `depsolve-package-metadata` | `aff1eccb426e` | `af8acb42778b` solver: add opt-in package_metadata level to the V2 API |
| image-builder | `depsolve-package-metadata` | `964a2fdc9a9c` | `d27e2f18f317` depsolvednf: let callers choose the package metadata level<br>`7bd6e1557b80` depsolvednf: add developer-only tracing of depsolver round trips<br>`6634b1a8dfcf` image-builder: add developer-only pprof hooks<br>`58760d43de2a` depsolvednf: add benchmarks for parsing captured V2 responses |

#### osbuild (`af8acb42`)

* The V2 request accepts `arguments.package_metadata`: `"full"` (default) or `"minimal"`. Any other value returns `InvalidRequestError`.
* Both dnf4 and dnf5 got a `_dnf_pkg_to_package_minimal`.
* The serializers for dump, search and depsolve honour the level.
* V1 is unchanged.
* Tests:
  * the request field is parsed and validated
  * the minimal serializers are covered for dump, search and depsolve
  * `test_dnf4_dnf5_minimal_package_is_projection_of_full` checks the minimal package against the full one
  * 247 + 87 + 1 tests pass

#### image-builder (`d27e2f18f`)

* New API: `depsolvednf.PackageMetadata`, `ParsePackageMetadata`, `(*Solver).SetPackageMetadata` and `AddOptionalMetadata`.
* The `package_metadata` field is sent on depsolve, dump and search (`omitempty`, so default requests are byte-identical).
* Developer-only switches go through `IMAGE_BUILDER_EXPERIMENTAL`; there is **no CLI flag**:
  * `depsolve-package-metadata=full|minimal`
  * `depsolve-optional-metadata=filelists`
  * `depsolve-no-sbom`
* Unit tests are in `pkg/depsolvednf/package_metadata_test.go`.

**Verified in `image-builder manifest` (trace `field_coverage`):**

* With full metadata, every package carries every non-empty field upstream returns, matching the Python model.
* With minimal, only the minimal set comes back.
* Package counts are identical across all variants.

### What is possible: field inventory

| field group | dnf4 | dnf5 | notes |
|---|---|---|---|
| NEVRA, arch, repo id, location, checksum | ✓ | ✓ | the minimal level |
| remote_locations | 1 URL (baseurl/mirror chosen) | **all mirrors (~94)** | dnf5 `get_remote_locations()`; dominates the dnf5 payload |
| summary, description, license, url, vendor, packager, buildtime, size, sourcerpm, header range | ✓ | ✓ | full level |
| requires/provides/conflicts/obsoletes/recommends/suggests/enhances/supplements | ✓ | ✓ | ~50–110 k reldeps for an image; ~1.9 M for the whole repo |
| files | only with `optional_metadata: ["filelists"]` | same | +2–3× convert time |
| changelogs | ✗ | ✗ | not exposed by the V2 model (open question) |

## Method

### Environment

| item | value |
|---|---|
| host | the "box" VM: Intel Xeon (model not reported by the hypervisor), 8 vCPU, 15 GiB RAM, kernel 6.12.94, podman 5.4.2 |
| container | Fedora 44, image `localhost/depsolve-perf-f44` (94587df21ea2), Python 3.14.8, python3-dnf 4.24.0, libdnf5 / python3-libdnf5 5.4.6, Go 1.26.9 |
| heavy runs | `podman run --memory 4g --memory-swap 4g` (scaling, dump/search, pipe, profiles); manifest matrix in the long-lived `ib-v2` container from the same image (no memory limit) |
| repos | Fedora 44 `fedora` + `updates` from the public mirrors (`solver-dnf4.json` / `solver-dnf5.json` select the solver); whole repo = **76 354 packages** |
| osbuild | `af8acb42` (branch `depsolve-package-metadata`, base upstream main `aff1eccb`); tool run from the source tree via `OSBUILD_DEPSOLVE_DNF` |
| image-builder | `58760d43d` (branch `depsolve-package-metadata`, base upstream main `964a2fdc9`), `go build -buildvcs=false -tags "exclude_graphdriver_btrfs containers_image_openpgp" ./cmd/image-builder` |

### Instrumentation

* **Python stage timers** (`bench/depsolve_timed.py`) wrap the real `osbuild-depsolve-dnf` code paths:
  * module import
  * request parse
  * repo metadata load (`Repo.load` / `fill_sack` / `load_repos`)
  * resolve
  * dnf pkg → `model.Package` (`pkg_convert`)
  * in-depsolver SBOM
  * disjoint sets
  * `model.Package` → dict
  * `json.dumps`
  * stdout write/flush
  * `ru_maxrss`

  Each wrapped call adds ~0.2–0.5 µs. The total effect is within noise: plain vs timed wall time is within run-to-run spread (`*_plain` variants in `runs/warm`).
* **Go trace** (`IMAGE_BUILDER_DEPSOLVE_TRACE`, commit `7bd6e1557`) writes one JSON line per depsolver round trip. It records:
  * request marshal
  * child process time, plus first and last byte arrival
  * `json.Unmarshal`
  * conversion to `rpmmd`
  * post-processing
  * child `maxrss` and CPU
  * Go self `maxrss` and allocations
  * package, reldep and file counts, and per-field coverage
* **Raw request/response capture** uses `IMAGE_BUILDER_DEPSOLVE_CAPTURE`.
* **pprof** hooks: `IMAGE_BUILDER_CPUPROFILE` and `IMAGE_BUILDER_MEMPROFILE`. **cProfile** via `PERF_PY_CPROFILE`, **py-spy** via `py-spy record`.
* **Go benchmarks** (`BenchmarkV2ParseUnmarshal` and `BenchmarkV2ParseFull`) run over the synthetic responses, chosen with the `DEPSOLVE_BENCH_FILES` glob.

### Variants

| variant | request | meaning |
|---|---|---|
| `today` | full metadata + SPDX SBOM in the depsolver | what upstream `image-builder manifest` does now |
| `full` | full metadata, no depsolver SBOM | the planned design (SBOM built in Go from the metadata) |
| `minimal` | `package_metadata: minimal`, no SBOM | Achilleas' lean variant |
| `full_files` | full + `optional_metadata: [filelists]`, no SBOM | upper bound (files in the SBOM) |

### Runs

* **Real image-type depsolves.** These are the only runs that include libsolv solve time and repo loading.
  * `image-builder manifest <type> --distro fedora-44` for 5 image types: generic-container, minimal-raw-xz, generic-qcow2, server-qcow2 and workstation-live-installer (288–2276 packages).
  * Both solvers, all 4 variants.
  * **5 repetitions** on a warm cache.
  * Separately, generic-qcow2 with `today` and `minimal` on a **cold cache**: the cache is deleted before each run, 3 reps.
  * Values are the **median (min–max)**. Each manifest makes 2 depsolver calls, one per pipeline, and the times are summed over the calls.
* **Scaling sweep**, which measures metadata transfer cost and **not** libsolv solve time:
  * `bench/py_scaling.py` loads the repos once, then takes seeded random samples of n packages from the whole repo, with n = 10, 30, 100, 300, 1000, 3000, 10 000, 30 000 and all (76 354).
  * On each sample it times the solver's own convert, disjoint, dict, dumps and write code. Median of 5 reps; 3 reps for filelists.
  * For every n it writes a real V2 response file. Go benchmarks (`-count 3`, median) parse **exactly the same sizes**, so Python and Go fits use the same points.
  * Solve time scales with the dependency graph, not with n, so it comes only from the real image-type depsolves above.
* **Whole-repo `dump` and `search *`** run end to end through the Go client (`bench/go/dsbench`) and the timed Python depsolver: both solvers, full and minimal, 3 reps.
* **Pipe throughput.** The child process just `cat`s a pre-made payload, so this measures the bytes over the pipe into Go with no JSON.

### Fit method (applied to every stage)

1. **Exponent:** least-squares line in log-log space, `log t = a + b·log n`, over the points with **n ≥ 100**, where fixed overheads no longer dominate. b ≈ 1 means linear.
2. **Per-package cost:** ordinary linear fit `t = c + k·n` over all points. k is reported in **µs per package**, with **R²**.
3. **Per-byte cost:** the same linear fit against payload bytes, `t = c' + k'·B`, reported in **ns per payload byte**.

The fits are computed in `bench/analyze_scaling.py` and written to `runs/scaling/fits.md`.

**Estimates** are clearly labelled as such: gzip -1 size, msgpack/CBOR size and `msgpack.packb` time from the Python dicts, and `GOEXPERIMENT=jsonv2` decode time. **No alternative wire format was implemented.**

## Results

### 1. Real image builds: per-stage, warm cache

![stacked stages, warm](plots/stages_warm.png)

`plots/stages_warm.png` shows the sum over both depsolve calls per manifest, as medians of 5 reps. Grey "image-builder rest" is wall time minus the depsolver round trips.

Each **metadata** column is the sum of:

* Python: convert + disjoint + dict + dumps + write
* Go: unmarshal + convert

Each **share** column is the metadata total as a fraction of wall time. The full per-stage tables, with min–max for every stage, are in `runs/warm/tables.md` and `runs/cold/tables.md`.

**dnf4, warm cache** (medians; seconds unless noted; metadata = Py convert+disjoint+dict+dumps+write + Go unmarshal+convert)

| image (pkgs) | variant | wall | repo load | resolve | Py convert | SBOM (py) | dumps+write | Go unmarshal | metadata total | share | IB rest | payload MB | Py RSS MiB | Go RSS MiB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| generic-container (288) | today | 4.21 | 0.82 | 0.18 | 0.05 | 0.12 | 0.010 | 0.012 | 0.08 | 1.9% | 2.77 | 1.4 | 124 | 68 |
| generic-container (288) | full | 4.10 | 0.85 | 0.16 | 0.05 | 0.00 | 0.006 | 0.008 | 0.07 | 1.6% | 2.67 | 0.9 | 120 | 69 |
| generic-container (288) | minimal | 4.30 | 1.07 | 0.16 | 0.01 | 0.00 | 0.001 | 0.002 | 0.02 | 0.4% | 2.76 | 0.1 | 120 | 69 |
| generic-container (288) | full_files | 4.73 | 1.16 | 0.17 | 0.17 | 0.00 | 0.018 | 0.025 | 0.22 | 4.7% | 2.75 | 3.0 | 131 | 73 |
| minimal-raw-xz (592) | today | 5.55 | 0.93 | 0.61 | 0.18 | 0.23 | 0.041 | 0.047 | 0.35 | 6.3% | 3.10 | 5.4 | 169 | 84 |
| minimal-raw-xz (592) | full | 5.14 | 0.88 | 0.62 | 0.19 | 0.00 | 0.033 | 0.042 | 0.32 | 6.2% | 2.93 | 4.2 | 160 | 80 |
| minimal-raw-xz (592) | minimal | 4.94 | 0.87 | 0.62 | 0.04 | 0.00 | 0.002 | 0.003 | 0.05 | 1.0% | 2.89 | 0.3 | 128 | 69 |
| minimal-raw-xz (592) | full_files | 5.91 | 1.17 | 0.64 | 0.49 | 0.00 | 0.054 | 0.069 | 0.69 | 11.6% | 3.06 | 8.0 | 182 | 88 |
| generic-qcow2 (704) | today | 5.51 | 1.04 | 0.69 | 0.21 | 0.26 | 0.042 | 0.054 | 0.39 | 7.0% | 2.83 | 5.9 | 170 | 85 |
| generic-qcow2 (704) | full | 5.20 | 0.89 | 0.70 | 0.21 | 0.00 | 0.032 | 0.045 | 0.34 | 6.5% | 2.87 | 4.5 | 162 | 80 |
| generic-qcow2 (704) | minimal | 4.89 | 0.96 | 0.69 | 0.05 | 0.00 | 0.002 | 0.004 | 0.06 | 1.3% | 2.75 | 0.4 | 128 | 68 |
| generic-qcow2 (704) | full_files | 5.90 | 1.16 | 0.73 | 0.54 | 0.00 | 0.054 | 0.076 | 0.75 | 12.6% | 2.79 | 8.6 | 184 | 87 |
| server-qcow2 (1095) | today | 6.46 | 0.93 | 1.21 | 0.30 | 0.39 | 0.058 | 0.070 | 0.51 | 7.9% | 2.90 | 8.1 | 191 | 88 |
| server-qcow2 (1095) | full | 5.92 | 0.95 | 1.16 | 0.31 | 0.00 | 0.045 | 0.058 | 0.49 | 8.1% | 2.95 | 5.7 | 174 | 85 |
| server-qcow2 (1095) | minimal | 5.63 | 1.07 | 1.21 | 0.07 | 0.00 | 0.004 | 0.006 | 0.09 | 1.6% | 3.10 | 0.6 | 131 | 68 |
| server-qcow2 (1095) | full_files | 6.66 | 1.30 | 1.21 | 0.74 | 0.00 | 0.079 | 0.094 | 1.03 | 15.1% | 2.87 | 11.5 | 212 | 104 |
| workstation-live-installer (2276) | today | 6.71 | 1.02 | 0.99 | 0.29 | 0.71 | 0.103 | 0.122 | 0.62 | 9.2% | 3.01 | 14.3 | 217 | 117 |
| workstation-live-installer (2276) | full | 6.21 | 1.04 | 0.98 | 0.29 | 0.00 | 0.080 | 0.108 | 0.64 | 10.3% | 3.16 | 9.2 | 189 | 115 |
| workstation-live-installer (2276) | minimal | 5.82 | 1.17 | 0.94 | 0.09 | 0.00 | 0.008 | 0.012 | 0.12 | 2.1% | 3.23 | 1.2 | 137 | 71 |
| workstation-live-installer (2276) | full_files | 6.97 | 1.05 | 0.95 | 0.82 | 0.00 | 0.170 | 0.172 | 1.33 | 19.5% | 3.06 | 20.2 | 242 | 139 |

**dnf5, warm cache** (medians; seconds unless noted; metadata = Py convert+disjoint+dict+dumps+write + Go unmarshal+convert)

| image (pkgs) | variant | wall | repo load | resolve | Py convert | SBOM (py) | dumps+write | Go unmarshal | metadata total | share | IB rest | payload MB | Py RSS MiB | Go RSS MiB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| generic-container (288) | today | 4.13 | 0.36 | 0.20 | 0.10 | 0.17 | 0.025 | 0.032 | 0.17 | 4.0% | 2.86 | 4.8 | 142 | 78 |
| generic-container (288) | full | 3.97 | 0.30 | 0.20 | 0.10 | 0.00 | 0.024 | 0.028 | 0.17 | 4.3% | 2.94 | 4.2 | 138 | 76 |
| generic-container (288) | minimal | 3.84 | 0.29 | 0.21 | 0.02 | 0.00 | 0.019 | 0.022 | 0.07 | 1.7% | 2.92 | 3.5 | 135 | 71 |
| generic-container (288) | full_files | 4.30 | 0.42 | 0.22 | 0.23 | 0.00 | 0.038 | 0.043 | 0.32 | 7.4% | 3.07 | 6.4 | 145 | 81 |
| minimal-raw-xz (592) | today | 4.97 | 0.27 | 0.27 | 0.52 | 0.42 | 0.084 | 0.086 | 0.75 | 15.2% | 2.77 | 12.4 | 208 | 104 |
| minimal-raw-xz (592) | full | 4.64 | 0.28 | 0.29 | 0.53 | 0.00 | 0.080 | 0.079 | 0.76 | 16.2% | 2.88 | 11.2 | 193 | 105 |
| minimal-raw-xz (592) | minimal | 3.94 | 0.34 | 0.27 | 0.07 | 0.00 | 0.039 | 0.041 | 0.16 | 4.1% | 2.85 | 7.3 | 155 | 85 |
| minimal-raw-xz (592) | full_files | 5.02 | 0.36 | 0.28 | 0.81 | 0.00 | 0.089 | 0.105 | 1.06 | 22.1% | 2.90 | 15.0 | 209 | 105 |
| generic-qcow2 (704) | today | 5.18 | 0.30 | 0.31 | 0.61 | 0.48 | 0.094 | 0.103 | 0.85 | 16.7% | 2.75 | 14.3 | 215 | 102 |
| generic-qcow2 (704) | full | 4.91 | 0.36 | 0.30 | 0.59 | 0.00 | 0.082 | 0.092 | 0.85 | 17.3% | 3.02 | 12.8 | 199 | 106 |
| generic-qcow2 (704) | minimal | 4.18 | 0.31 | 0.31 | 0.08 | 0.00 | 0.046 | 0.047 | 0.19 | 4.8% | 2.97 | 8.7 | 165 | 86 |
| generic-qcow2 (704) | full_files | 5.18 | 0.39 | 0.31 | 0.93 | 0.00 | 0.104 | 0.126 | 1.22 | 24.0% | 2.94 | 16.9 | 217 | 117 |
| server-qcow2 (1095) | today | 5.89 | 0.29 | 0.40 | 0.87 | 0.66 | 0.169 | 0.138 | 1.30 | 22.1% | 2.86 | 21.0 | 252 | 146 |
| server-qcow2 (1095) | full | 5.22 | 0.30 | 0.41 | 0.90 | 0.00 | 0.127 | 0.128 | 1.32 | 24.8% | 2.86 | 18.7 | 234 | 120 |
| server-qcow2 (1095) | minimal | 4.22 | 0.28 | 0.41 | 0.13 | 0.00 | 0.078 | 0.075 | 0.31 | 7.2% | 2.87 | 13.5 | 189 | 104 |
| server-qcow2 (1095) | full_files | 6.30 | 0.41 | 0.40 | 1.42 | 0.00 | 0.178 | 0.174 | 1.94 | 32.6% | 2.92 | 24.4 | 262 | 155 |
| workstation-live-installer (2276) | today | 6.96 | 0.29 | 0.52 | 0.83 | 1.15 | 0.316 | 0.272 | 1.55 | 22.7% | 2.87 | 41.6 | 302 | 230 |
| workstation-live-installer (2276) | full | 5.69 | 0.31 | 0.52 | 0.91 | 0.00 | 0.226 | 0.249 | 1.53 | 27.3% | 2.87 | 36.6 | 273 | 148 |
| workstation-live-installer (2276) | minimal | 4.60 | 0.29 | 0.52 | 0.15 | 0.00 | 0.166 | 0.162 | 0.51 | 11.5% | 2.87 | 28.5 | 223 | 150 |
| workstation-live-installer (2276) | full_files | 6.42 | 0.40 | 0.52 | 1.39 | 0.00 | 0.351 | 0.311 | 2.22 | 34.9% | 2.92 | 47.6 | 311 | 246 |

**dnf4, cold cache** (medians; seconds unless noted; metadata = Py convert+disjoint+dict+dumps+write + Go unmarshal+convert)

| image (pkgs) | variant | wall | repo load | resolve | Py convert | SBOM (py) | dumps+write | Go unmarshal | metadata total | share | IB rest | payload MB | Py RSS MiB | Go RSS MiB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| generic-qcow2 (704) | today | 11.57 | 5.70 | 1.68 | 0.25 | 0.29 | 0.053 | 0.058 | 0.45 | 3.9% | 3.01 | 5.9 | 201 | 88 |
| generic-qcow2 (704) | minimal | 11.48 | 6.28 | 1.65 | 0.05 | 0.00 | 0.003 | 0.006 | 0.06 | 0.5% | 3.09 | 0.4 | 192 | 68 |

**dnf5, cold cache** (medians; seconds unless noted; metadata = Py convert+disjoint+dict+dumps+write + Go unmarshal+convert)

| image (pkgs) | variant | wall | repo load | resolve | Py convert | SBOM (py) | dumps+write | Go unmarshal | metadata total | share | IB rest | payload MB | Py RSS MiB | Go RSS MiB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| generic-qcow2 (704) | today | 11.50 | 5.57 | 1.28 | 0.63 | 0.50 | 0.103 | 0.101 | 0.90 | 7.8% | 2.95 | 14.3 | 233 | 110 |
| generic-qcow2 (704) | minimal | 10.26 | 5.42 | 1.26 | 0.09 | 0.00 | 0.051 | 0.052 | 0.20 | 2.0% | 2.97 | 8.7 | 207 | 87 |

**What this table shows:**

* **Full vs minimal** (both without SBOM), at 288 → 2276 packages:
  * dnf4: +0.05 → +0.52 s of metadata stages
  * dnf5: +0.10 → +1.02 s of metadata stages

  Wall-time differences are noisier, because repo load varies by ±0.3 s from `Repo.load`'s metadata freshness check.
* **today → full** (dropping the in-depsolver SBOM) saves 0.12–0.71 s with dnf4 and 0.17–1.15 s with dnf5. That is the same order as the full-vs-minimal difference.
* **Python `pkg_convert` is the largest metadata stage:**
  * 0.29 s for dnf4 workstation and 0.91 s for dnf5 workstation
  * against 0.08–0.23 s for dumps+write and 0.11–0.25 s for Go Unmarshal
* **dnf5 minimal is still 3.5–28.5 MB**, because of `remote_locations`: every mirror, ~94 URLs per package. In the dnf5 workstation full response, mirror URLs are ~75–81 % of the bytes (94 URLs/package).
* **Cold cache:** repo download and load takes ~5.4–6.3 s and dominates. The metadata stages cost the same as on a warm cache.
* **Peak RSS:**
  * Python depsolver 120–311 MiB, about +30–110 MiB for full vs minimal
  * Go process 68–246 MiB
* **Profiles** (workstation-live-installer, full, no SBOM) are in `runs/profiles/`: `*.pstats`, `*.top.txt`, py-spy `*.svg` and `*.speedscope.json`.
  * **dnf5:** of 2.8 s of Python, `_dnf_pkg_to_package` takes 1.61 s cumulative. Within it:
    * `get_description` 0.16 s, i.e. ~80 µs per call, the single most expensive attribute
    * reldep iteration 0.36 s
    * `get_remote_locations` 0.10 s
    * `get_files` 0.10 s, called even without filelists
  * **dnf4:** `_dnf_pkg_to_package` takes 0.52 s cumulative. The rest is `Swdb_addItem` 0.30 s (history DB items during resolve), `Sack.load_repo` called twice (0.29 s) and `Query.union` 0.22 s.
  * **Go (pprof):** YAML distro-definition decoding is 62 % of image-builder CPU. `distrosort.Names` → `ParseID` → `loadDistros` accounts for 35 %, which suggests definitions are reloaded inside a sort comparator. The depsolve JSON parse is ≈1.5 %.

### 2. Scaling: metadata transfer cost vs number of packages and payload bytes

> This sweep converts and serializes **random samples of already-loaded repo packages**. It measures **metadata transfer cost only**: no libsolv solve and no repo loading. Solve time is in section 1.

| | |
|---|---|
| ![dnf4](plots/scaling_stages_dnf4.png) | ![dnf5](plots/scaling_stages_dnf5.png) |
| ![bytes](plots/scaling_bytes.png) | ![time vs bytes](plots/scaling_time_vs_bytes.png) |

**Fits.** The exponent is fitted over n ≥ 100. The µs/package and ns/byte columns are linear fits over all points; R² is for the linear-in-n fit.

| solver | files | level | stage | exponent b (t ∝ n^b) | µs per package | ns per payload byte | R² (linear) |
|---|---|---|---|---|---|---|---|
| dnf4 | False | full | Py pkg_convert | 1.02 | 225.09 | 82.69 | 1.000 |
| dnf4 | False | full | Py disjoint | 1.15 | 26.48 | 9.69 | 0.999 |
| dnf4 | False | full | Py pkg_dict | 1.31 | 61.04 | 22.34 | 0.997 |
| dnf4 | False | full | Py json_dumps | 1.09 | 19.37 | 7.12 | 1.000 |
| dnf4 | False | full | Py write | 0.74 | 1.25 | 0.47 | 0.985 |
| dnf4 | False | full | Go Unmarshal | 1.03 | 27.73 | 10.22 | 0.999 |
| dnf4 | False | full | Go Full | 1.02 | 27.86 | 10.26 | 0.999 |
| dnf4 | False | minimal | Py pkg_convert | 0.99 | 42.18 | 79.43 | 1.000 |
| dnf4 | False | minimal | Py disjoint | 1.19 | 15.39 | 28.81 | 0.997 |
| dnf4 | False | minimal | Py pkg_dict | 1.29 | 2.34 | 4.39 | 0.999 |
| dnf4 | False | minimal | Py json_dumps | 1.09 | 3.58 | 6.72 | 0.999 |
| dnf4 | False | minimal | Py write | 0.55 | 0.29 | 0.55 | 0.992 |
| dnf4 | False | minimal | Go Unmarshal | 1.02 | 5.16 | 9.73 | 1.000 |
| dnf4 | False | minimal | Go Full | 1.02 | 5.65 | 10.64 | 0.999 |
| dnf4 | True | full | Py pkg_convert | 1.05 | 716.43 | 56.57 | 0.999 |
| dnf4 | True | full | Py disjoint | 1.12 | 28.21 | 2.23 | 1.000 |
| dnf4 | True | full | Py pkg_dict | 1.27 | 36.29 | 2.87 | 0.998 |
| dnf4 | True | full | Py json_dumps | 1.08 | 43.12 | 3.40 | 1.000 |
| dnf4 | True | full | Py write | 0.81 | 5.64 | 0.45 | 0.997 |
| dnf4 | True | full | Go Unmarshal | 1.02 | 92.27 | 7.28 | 1.000 |
| dnf4 | True | full | Go Full | 1.00 | 89.68 | 7.08 | 1.000 |
| dnf4 | True | minimal | Py pkg_convert | 0.97 | 37.45 | 70.68 | 1.000 |
| dnf4 | True | minimal | Py disjoint | 1.16 | 10.41 | 19.65 | 0.999 |
| dnf4 | True | minimal | Py pkg_dict | 1.26 | 1.71 | 3.23 | 0.998 |
| dnf4 | True | minimal | Py json_dumps | 1.02 | 2.53 | 4.77 | 1.000 |
| dnf4 | True | minimal | Py write | 0.45 | 0.36 | 0.68 | 0.999 |
| dnf4 | True | minimal | Go Unmarshal | 1.02 | 5.34 | 10.07 | 1.000 |
| dnf4 | True | minimal | Go Full | 1.02 | 5.17 | 9.76 | 1.000 |
| dnf5 | False | full | Py pkg_convert | 1.02 | 349.00 | 22.67 | 0.999 |
| dnf5 | False | full | Py disjoint | 1.11 | 31.95 | 2.07 | 0.999 |
| dnf5 | False | full | Py pkg_dict | 1.35 | 74.10 | 4.73 | 0.973 |
| dnf5 | False | full | Py json_dumps | 1.07 | 53.87 | 3.50 | 1.000 |
| dnf5 | False | full | Py write | 0.83 | 7.24 | 0.47 | 1.000 |
| dnf5 | False | full | Go Unmarshal | 1.00 | 96.26 | 6.28 | 1.000 |
| dnf5 | False | full | Go Full | 1.00 | 100.02 | 6.52 | 1.000 |
| dnf5 | False | minimal | Py pkg_convert | 1.04 | 75.51 | 5.73 | 0.998 |
| dnf5 | False | minimal | Py disjoint | 1.15 | 20.87 | 1.58 | 0.998 |
| dnf5 | False | minimal | Py pkg_dict | 1.33 | 2.19 | 0.17 | 0.996 |
| dnf5 | False | minimal | Py json_dumps | 1.07 | 35.56 | 2.71 | 1.000 |
| dnf5 | False | minimal | Py write | 0.80 | 6.11 | 0.47 | 1.000 |
| dnf5 | False | minimal | Go Unmarshal | 0.99 | 71.20 | 5.44 | 1.000 |
| dnf5 | False | minimal | Go Full | 0.99 | 70.00 | 5.35 | 1.000 |


**What the fits show:**

* **Every stage is linear in n and in bytes.** Exponents are 0.97–1.09, except:
  * `pkg_dict` at 1.26–1.35, and disjoint sets at 1.11–1.19, a mild super-linearity probably caused by CPython GC traversal with many live objects
  * `write` below 1, which is fixed-overhead dominated
* **No stage is quadratic.**
* **Missing points:** dnf5 "all" and dnf4+filelists "all" were **OOM-killed** at the 4 GiB limit. The dnf5 full whole-repo response is ≈1.2 GB of JSON. Those series stop at 30 000 and 10 000 packages.
* **The sweep's per-package convert cost is an upper bound.** It is 225 µs/pkg for dnf4 full, while the real image depsolves measure ~130 µs/pkg (workstation: 0.29 s for 2276 packages) and the streaming whole-repo dump ~62 µs/pkg. Random-order sampling across the sack, with all models kept alive, is slower than sequential iteration. The *shape* (linear) holds either way.
* **Go is roughly 4–10× cheaper per package than Python:** Unmarshal costs ~6–10 ns per payload byte.

**Size and encoder estimates** (*estimates only, no wire format implemented*). Payloads were re-encoded from the same Python dicts:

| solver | files | level | n | bytes | gzip-1 (est.) | msgpack (est.) | cbor (est.) | Py convert s | Py dict s | Py dumps s | Py write s | Py msgpack.packb s (est.) | Go Unmarshal s | Go Unmarshal+convert s |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dnf4 | False | full | 1000 | 2.56 MB | 0.40 MB | 2.11 MB | 2.12 MB | 0.199 | 0.015 | 0.013 | 0.003 | 0.009 | 0.027 | 0.028 |
| dnf4 | False | full | 30000 | 82.72 MB | 10.52 MB | 68.32 MB | 68.51 MB | 6.658 | 1.909 | 0.602 | 0.048 | 0.627 | 0.891 | 0.895 |
| dnf4 | False | full | 76354 | 207.15 MB | 24.28 MB | 171.33 MB | 171.80 MB | 17.160 | 4.566 | 1.468 | 0.097 | 1.412 | 2.108 | 2.114 |
| dnf4 | False | minimal | 1000 | 0.53 MB | 0.08 MB | 0.47 MB | 0.47 MB | 0.040 | 0.001 | 0.002 | 0.001 | 0.001 | 0.004 | 0.005 |
| dnf4 | False | minimal | 30000 | 15.90 MB | 2.08 MB | 14.07 MB | 14.08 MB | 1.208 | 0.065 | 0.101 | 0.008 | 0.070 | 0.159 | 0.156 |
| dnf4 | False | minimal | 76354 | 40.48 MB | 5.04 MB | 35.83 MB | 35.84 MB | 3.227 | 0.178 | 0.272 | 0.023 | 0.251 | 0.392 | 0.433 |
| dnf4 | True | full | 1000 | 11.31 MB | 1.30 MB | 10.62 MB | 10.63 MB | 0.523 | 0.015 | 0.032 | 0.010 | 0.024 | 0.081 | 0.082 |
| dnf4 | True | minimal | 1000 | 0.53 MB | 0.08 MB | 0.47 MB | 0.47 MB | 0.038 | 0.001 | 0.002 | 0.001 | 0.001 | 0.005 | 0.005 |
| dnf5 | False | full | 1000 | 15.12 MB | 1.02 MB | 14.49 MB | 14.50 MB | 0.302 | 0.015 | 0.040 | 0.010 | 0.040 | 0.099 | 0.100 |
| dnf5 | False | full | 30000 | 460.10 MB | 29.51 MB | 440.18 MB | 440.34 MB | 10.464 | 2.209 | 1.611 | 0.219 | 1.300 | 2.884 | 3.001 |
| dnf5 | False | minimal | 1000 | 13.09 MB | 0.62 MB | 12.85 MB | 12.85 MB | 0.061 | 0.001 | 0.029 | 0.009 | 0.014 | 0.077 | 0.073 |
| dnf5 | False | minimal | 30000 | 393.28 MB | 18.37 MB | 385.93 MB | 385.91 MB | 2.263 | 0.066 | 1.063 | 0.185 | 1.076 | 2.133 | 2.097 |

* **msgpack/CBOR** save only **~5–17 %** of bytes, and `msgpack.packb` takes about the same time as `json.dumps`. The payload is mostly strings, so there is little for a binary format to save.
* **gzip -1** is 8–15× smaller: dnf5 mirror lists compress very well.
* **`GOEXPERIMENT=jsonv2`** (estimate, the same Go benchmarks rebuilt): decode is **1.6–2.1× faster** at every size. The one exception is the 76 354-package `Unmarshal` point at 0.75×, likely memory pressure in the 4 GiB container. The full table is in `runs/scaling/fits.md`.

### 3. Whole-repo `dump` and `search *` (76 354 packages), end to end

The medians below are from 3 reps in a 4 GiB container. "Payload" is the JSON response size. The table is generated by `bench/analyze_dump.py` into `runs/dump/tables.md`.

| solver-metadata | cmd | runs ok | wall s (median, min–max) | py import | py repo load | py pkg_convert | py dict | py json.dumps | py write | Go Unmarshal | Go convert | payload MB | py RSS MiB | Go RSS MiB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| dnf4-full | dump | 3/3 | 10.83 (10.68–11.56) | 0.14 | 0.91 | 4.71 | 0.68 | 1.32 | 0.68 | 2.03 | 0.08 | 207 | 132 | 872 |
| dnf4-full | search | 3/3 | 17.16 (16.35–17.32) | 0.13 | 0.53 | 7.13 | 4.27 | 1.07 | 0.86 | 2.17 | 0.09 | 207 | 1656 | 872 |
| dnf4-minimal | dump | 3/3 | 4.70 (4.34–4.88) | 0.13 | 0.91 | 2.50 | 0.04 | 0.31 | 0.16 | 0.42 | 0.03 | 40 | 125 | 377 |
| dnf4-minimal | search | 3/3 | 4.74 (4.68–4.86) | 0.13 | 0.54 | 2.74 | 0.08 | 0.15 | 0.13 | 0.45 | 0.03 | 40 | 443 | 377 |
| dnf5-full | dump | 0/3 | OOM-killed at 4 GiB | | | | | | | | | | | |
| dnf5-full | search | 0/3 | OOM-killed at 4 GiB | | | | | | | | | | | |
| dnf5-minimal | dump | 3/3 | 15.59 (15.52–15.72) | 0.12 | 0.35 | 3.73 | 0.05 | 2.30 | 2.49 | 5.91 | 0.02 | 1001 | 115 | 3106 |
| dnf5-minimal | search | 0/3 | OOM-killed at 4 GiB | | | | | | | | | | | |

* **dnf4 full dump: 10.8 s and 207 MB.** It streams, so Python RSS stays at 132 MiB, but Go holds 872 MiB.
* **dnf4 full `search *`: 17.2 s and 1.6 GiB Python RSS.** Search builds the whole list, then `json.dumps` it.
* **minimal cuts dnf4 dump/search to ~4.7 s and 40 MB.**
* **dnf5 full dump and search were OOM-killed** (SIGKILL) at 4 GiB, in both Python and Go.
* **dnf5 minimal dump still produces 1.0 GB** (mirror URLs). It takes 15.6 s and 3.1 GiB of Go RSS, and dnf5 minimal search OOMs.

**Side finding:** when the depsolver is killed mid-output, the Go client reports `Failed to unmarshal osbuild-depsolve-dnf error output "{\"solver\": \"dnf5\", \"packages\": [...`. It treats the truncated stdout as an error document, so the real cause, a killed child, gets lost.

### 4. Pipe throughput (no JSON)

The child writes a pre-made payload file to stdout and Go reads it all. Medians of 3 reps:

| payload file | MB | pipe transfer ms (median) | MB/s | child process ms |
|---|---|---|---|---|
| dnf4-full-000010 | 0.03 | 0.0 | 1085 | 14 |
| dnf4-full-000030 | 0.08 | 0.1 | 661 | 13 |
| dnf4-full-000100 | 0.24 | 0.4 | 675 | 14 |
| dnf4-full-000300 | 0.73 | 1.3 | 567 | 16 |
| dnf4-full-001000 | 2.56 | 6.3 | 407 | 22 |
| dnf4-full-003000 | 7.66 | 12.4 | 616 | 31 |
| dnf4-full-010000 | 27.58 | 55.3 | 499 | 86 |
| dnf4-full-030000 | 82.72 | 206.0 | 402 | 285 |
| dnf4-full-076354 | 207.16 | 436.8 | 474 | 635 |
| dnf5-full-000010 | 0.16 | 0.3 | 579 | 14 |
| dnf5-full-000030 | 0.46 | 0.6 | 716 | 14 |
| dnf5-full-000100 | 1.51 | 3.3 | 459 | 20 |
| dnf5-full-000300 | 4.51 | 12.3 | 366 | 30 |
| dnf5-full-001000 | 15.12 | 25.9 | 585 | 50 |
| dnf5-full-003000 | 45.35 | 105.4 | 430 | 158 |
| dnf5-full-010000 | 153.31 | 388.0 | 395 | 518 |
| dnf5-full-030000 | 460.10 | 828.5 | 555 | 1107 |

**Bytes over the pipe cost ~2 ms/MB** (400–700 MB/s). For an image build (1–40 MB) that is under 100 ms; it is not the bottleneck.

## Conclusion

* **Achilleas' concern holds only partly.** For image builds, full metadata on every call costs **0.05–0.5 s with dnf4 and 0.1–1.0 s with dnf5** per manifest, against 4–6 s of wall time.
  * That is less than the in-depsolver SBOM it would replace, which costs 0.12–1.15 s.
  * Separate requests would *add* round trips. Each one costs ~0.35 s of interpreter start and import, plus 0.3–1.3 s of repo load, which is more than the metadata transfer.
* **Tomas' wire-format idea would not help much.** JSON encode/decode plus the pipe is **~20–35 %** of the metadata cost. A binary format saves ≤17 % of bytes (estimate), and Go jsonv2 alone gives ~2× on decode.
* **The dominant cost is the Python DNF → model conversion.** It runs the same whatever the encoding.
* **Where full metadata does hurt is whole-repo `dump`/`search`:**
  * tens of seconds and hundreds of MB to over 1 GB
  * OOM at 4 GiB with dnf5
  * Tomas' instinct that full metadata is too much *for search/dump* is supported by the data.
* **Suggested direction:**
  1. Keep **full metadata for depsolve**, and drop the depsolver SBOM once Go builds it.
  2. Make **dump/search minimal, or field-selectable**.
  3. **Trim dnf5 `remote_locations`** to what dnf4 sends.
  4. Optimize **`_dnf_pkg_to_package`**: for example, skip `get_files` without filelists, and compute reldeps lazily or skip them.

  All four are larger wins than changing the wire format.

## Reproduce

All scripts are in `/workspace/depsolve-perf/bench`. Paths assume `/workspace/depsolve-perf`. The container image is `localhost/depsolve-perf-f44`, built as Fedora 44 + `golang python3-dnf python3-libdnf5 python3-matplotlib python3-msgpack python3-cbor2 time perf py-spy hyperfine`.

```sh
# branches
git -C osbuild checkout depsolve-package-metadata        # af8acb42
git -C image-builder checkout depsolve-package-metadata  # 58760d43d
(cd image-builder && go build -buildvcs=false -tags "exclude_graphdriver_btrfs containers_image_openpgp" -o ../bin/image-builder ./cmd/image-builder)
(cd bench/go && go build -o ../../bin/dsbench ./dsbench)

# unit tests
(cd osbuild && python3 -m pytest test/mod/test_solver_api_v2.py test/mod/test_solver_implementations.py)
(cd image-builder && go test ./pkg/depsolvednf/ -run 'ParsePackageMetadata|TestV2RequestsCarryPackageMetadata|TestV2ParseMinimal')

# 1. warm manifest matrix (5 image types x 2 solvers x 4 variants x 5 reps)
podman exec -w $PWD ib-v2 python3 bench/run_matrix.py --out runs/warm --cache warm --reps 5 \
  --images generic-container,minimal-raw-xz,generic-qcow2,server-qcow2,workstation-live-installer
podman exec -w $PWD ib-v2 python3 bench/analyze_matrix.py runs/warm --md runs/warm/tables.md --json runs/warm/summary.json --plot plots/stages_warm.png
python3 bench/overview_table.py warm

# 2-5. cold matrix, Python sweeps, Go benchmarks (+jsonv2 estimate), whole-repo dump/search, pipe
bench/run_rest.sh
podman exec -w $PWD ib-v2 python3 bench/analyze_matrix.py runs/cold --variants today,minimal --md runs/cold/tables.md --json runs/cold/summary.json
python3 bench/overview_table.py cold
podman exec -w $PWD ib-v2 python3 bench/analyze_scaling.py    # fits.md + scaling plots
python3 bench/analyze_dump.py runs/dump

# profiles (cProfile, py-spy, pprof) of workstation-live-installer
bench/run_profiles.sh
```

**Developer-only knobs** (no CLI flags):

| knob | effect |
|---|---|
| `IMAGE_BUILDER_EXPERIMENTAL=depsolve-package-metadata=minimal` | request the `minimal` metadata level (default `full`) |
| `IMAGE_BUILDER_EXPERIMENTAL=depsolve-optional-metadata=filelists` | also request filelists |
| `IMAGE_BUILDER_EXPERIMENTAL=depsolve-no-sbom` | don't build the SBOM in the depsolver |
| `IMAGE_BUILDER_DEPSOLVE_TRACE=<file>` | per-call trace as JSON lines |
| `IMAGE_BUILDER_DEPSOLVE_CAPTURE=<dir>` | save the raw request and response |
| `IMAGE_BUILDER_CPUPROFILE`, `IMAGE_BUILDER_MEMPROFILE` | write pprof profiles |
| `DEPSOLVE_BENCH_FILES='<glob>' go test -bench V2Parse ./pkg/depsolvednf/` | run the parse benchmarks on captured or synthetic responses |
| `OSBUILD_DEPSOLVE_DNF=bench/osbuild-depsolve-dnf-timed PERF_PY_TRACE=<file> [PERF_PY_CPROFILE=<file>]` | run the timed Python harness |

> Note: in the container, `/usr/libexec/osbuild-depsolve-dnf` is an older build. Always set `OSBUILD_DEPSOLVE_DNF`.

## Caveats

* **One VM, shared with other agents.** The run-to-run spread is in every table (min–max). Repo load is the noisiest stage because of the `Repo.load` freshness check.
* **The scaling sweep samples randomly.** Its per-package convert cost is an upper bound; see section 2.
* **4 GiB memory limit:** the dnf5 whole-repo full and dnf4+filelists whole-repo points were OOM-killed, and are reported as such rather than extrapolated.
* **The wall time in the warm-matrix `today` column reflects current upstream.** `full`/`minimal` are prototype levels on the local branches.

## Open questions

The same list is in `/workspace/ACTION-ITEMS.md` under "Depsolve metadata".

### M1. Keep full metadata for depsolve?

* **Data:** full vs minimal costs +0.05–0.5 s with dnf4 and +0.1–1.0 s with dnf5 per manifest (4–6 s wall). That is less than the in-depsolver SBOM (0.12–1.15 s), which full metadata would replace.
* **Proposal:** keep full metadata for depsolve, and don't split requests. Each extra call costs ≥0.35 s of startup plus 0.3–1.3 s of repo load.
* **Decision needed:** Achilleas, Tomas.

### M2. Should `package_metadata` (full|minimal) become a real API option, or should dump/search just default to minimal?

* **Data:** dnf4 whole-repo full is 207 MB and 10.8 s (dump) or 17.2 s with 1.6 GiB RSS (search). dnf5 full OOMs at 4 GiB.
* **Options:**
  * (a) keep the opt-in level (prototype)
  * (b) field selection (`fields: [...]`)
  * (c) dump/search minimal by default

### M3. dnf5 `remote_locations` returns every mirror (~94 URLs per package)

* **Data:** 75–81 % of dnf5 payload bytes. The dnf5 minimal whole-repo dump is still 1.0 GB. dnf4 returns 1 URL.
* **Options:** first URL only / baseurl only, or send mirror lists once per repo instead of per package.
* **Affects:** osbuild solver, plus anything consuming `remote_locations`.

### M4. Optimize `_dnf_pkg_to_package`, the largest metadata cost (60–70 %)

* **Data:**
  * dnf5 calls `get_files()` even without filelists (0.1 s for 2k packages)
  * `get_description` costs ~80 µs per call
  * reldep iteration is ~0.36 s for 100 k reldeps
* **Options:** skip files when filelists are off; lazy or opt-in reldeps (most of the size, not needed for an SBOM); cache per transaction.

### M5. Chained transactions reconvert every package, and `_transactions_to_disjoint_sets` hashes full Packages with all their reldeps

* **Option:** convert once per package id and hash on NEVRA+checksum.

### M6. dnf4 loads repos twice

* **Data:** `update_cache()` → `fill_sack`, then `fill_sack` again. pstats shows `Sack.load_repo` 2× and 0.29 s.
* **Note:** this is independent of metadata.

### M7. image-builder spends ~2.8–3.1 s per manifest outside the depsolve

* **Data:** YAML decode is 62 % of CPU, and `distrosort.Names` → `ParseID` → `loadDistros` is 35 %, which suggests definitions are reloaded inside a sort comparator.
* **Note:** this is the largest single block in every manifest. It is a separate issue, but worth filing.

### M8. Go JSON decoder

* **Data:** `GOEXPERIMENT=jsonv2` decodes 1.6–2× faster (estimate). Go Unmarshal is 0.1–0.3 s per image build.
* **Option:** cheap to adopt once jsonv2 is GA. No custom wire format is needed. msgpack/CBOR would save ≤17 % of bytes (estimate).

### M9. A killed depsolver is misreported as "Failed to unmarshal osbuild-depsolve-dnf error output"

* **Cause:** truncated stdout is parsed as an error document.
* **Fix:** check the exit status and signal first.

### M10. Missing fields for the SBOM

* changelogs are not exposed by the V2 model
* files require `optional_metadata: filelists`, which makes convert 2–3× slower and doubles the payload

Decide what protobom needs before freezing the field set.
