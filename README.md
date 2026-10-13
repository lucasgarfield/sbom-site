# SBOM diff: today vs. the patched image-builder SBOMs

A static page (plain HTML/CSS/JS, no build step) that compares disk-image SBOMs. Open `index.html` directly, or serve it with GitHub Pages.

## Comparisons
1. **osbuild patches:** unpatched vs patched osbuild, same CentOS 9 qcow2 depsolve (manifest-time, so no disk checksum).
2. **syft (Konflux-like) vs image-builder:** the same Fedora 44 oci.tar scanned by syft 1.54.1 vs the patched image-builder build SBOM.
3. **build-vm-image today vs patched build:** the Konflux FCOS rawhide container SBOM vs a CentOS 9 tar build with sha256. The content differs, so this compares shape only.
4. **Patched build vs mobster fold:** `mobster oci-artifact --from-sbom --fold-content-root`.

Sections: scorecard (measured results only; unmeasured cells say "not run"), structure trees, a per-package field diff, field coverage, a package-set diff, and links to the PRs:
[osbuild#1](https://github.com/lucasgarfield/osbuild/pull/1), [mobster#1](https://github.com/lucasgarfield/mobster/pull/1), [security-data-guidelines#1](https://github.com/lucasgarfield/security-data-guidelines/pull/1).

## Regenerate
```
SBOM_RESEARCH=path/to/sbom-research SBOM_OUTPUT=path/to/sbom-output python3 preprocess.py
```
This writes `data/sboms.json` and `data/sboms.js`; the `.js` copy lets the page work from `file://`. The scorecard values are in `data/scorecard.js`, copied by hand from the tool outputs, and each row names its source file.
