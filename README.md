# Fedora qcow2 SBOMs: osbuild main vs. the patches

A static page (plain HTML/CSS/JS, no build step) with two cases, each comparing osbuild/image-builder **main (unpatched)** against **our patches**: osbuild ([lucasgarfield/osbuild#1](https://github.com/lucasgarfield/osbuild/pull/1)) plus local image-builder patches 0001–0005.

1. **Package mode:** Fedora 44 `qcow2`. Both sides are real builds in a Fedora 44 VM (TCG), from the same depsolve (identical manifests). The patched SBOM records the built qcow2's sha256 on its root.
2. **bootc:** a qcow2 built from `quay.io/fedora/fedora-bootc@sha256:36c8aac4…` (amd64).
   - **main:** writes no SBOM for `--bootc-ref`, even with `--with-sbom` (checked: the manifest is written, but no `*.spdx.json`).
   - **patched:** a local prototype (images patch 0005, not in a PR). `--bootc-ref-sbom <file>` takes the container's SPDX SBOM, refuses it if its root doesn't name the resolved container digest, lists its packages inline under the disk root (CONTAINS), and links it with externalDocumentRef + GENERATED_FROM. The disk's sha256 is recorded after the build.
   - **container SBOM:** the image has no published SBOM (no cosign/referrer artifacts), so the input was generated with syft 1.54.1 (`--select-catalogers rpm`) from the amd64 digest.

Every SBOM's header says whether it is *built* (real build, sha256 recorded), *manifest-time*, an *input*, or *pending*.

## Scorecard checks
Each check was run on the exact SBOM shown:
- spdx-tools
- SBOM-Grader
- mequal: upstream and ProdSec-patched policies
- mobster `generate oci-artifact --from-sbom`: upstream 3912af8 and the PR branch with `--fold-content-root`, using the real disk sha256
- Conforma `ec validate image`, run the way Konflux does (local registry, `cosign attach sbom`, Chains-style SLSA provenance, local key): FCOS tenant production policy and `@redhat_security`. The provenance is faked from the conforma acceptance golden sample, so the same non-SBOM violations appear in every case. The SBOM and RPM rule counts are listed separately.
- Trustify 0.6.3 (local `trustd`): ingestion warnings, package count, advisory matches. No Fedora advisory data exists, so 0 matches is expected.

Cells that weren't measured say *not run*. Cells that can't apply (no SBOM, or mobster refused the input) say *n/a*.

## Regenerate
```
SBOM_RESEARCH=path/to/sbom-research SBOM_OUTPUT=path/to/sbom-output python3 preprocess.py
```
This reads the SBOMs from `$SBOM_OUTPUT/fedora-qcow2/{u-pkg-built,p-pkg-built,p-bootc-built}` and `$SBOM_RESEARCH/bootc/container.syft.spdx.json`, plus tool results from `$SBOM_OUTPUT/fedora-qcow2/results/`. Those results are produced by `eval-fedora.sh` and `conforma-fedora.sh` in sbom-research. It writes `data/sboms.json`, `data/sboms.js` (lets the page work from `file://`) and `data/meta.json` (cases and scorecard).
