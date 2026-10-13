# osbuild SBOMs: main vs. the patch series

A static page (plain HTML/CSS/JS, no build step) that compares two SBOMs for the **same CentOS 9 qcow2 depsolve**:

- **A:** written by osbuild main (unpatched)
- **B:** written by osbuild with the patches in [lucasgarfield/osbuild#1](https://github.com/lucasgarfield/osbuild/pull/1)

Both are the image-os SBOM written at manifest time, so neither has a disk checksum.

Sections:
- **Scorecard:** only tools actually run on these two files (spdx-tools, sbom-grader, mequal). Trustify and Conforma are marked not run.
- **Document structure trees**
- **Per-package field diff**
- **Field coverage table**
- **Package-set diff:** a version change that only appends the release (e.g. `5.1.8` → `5.1.8-9.el9`) is labelled "release added".

## Regenerate
```
SBOM_OUTPUT=path/to/sbom-output python3 preprocess.py
```
This reads `centos-9-unpatched/centos-9-qcow2-x86_64.image-os.spdx.json` and `final/manifest-centos-9/centos-9-qcow2-x86_64.image-os.spdx.json`, and writes `data/sboms.json` and `data/sboms.js`; the `.js` copy makes the page work from `file://`. The scorecard values are in `data/scorecard.js`.
