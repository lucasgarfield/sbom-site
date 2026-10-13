// Measured on exactly these two files: eval-final.sh (spdx-tools, mequal, sbom-grader) re-run on 2026-10-13. "nr" = not run on these files.
window.SCORECARD={
 cols:["osbuild main (unpatched)","osbuild + patches (osbuild#1)"],
 rows:[
  {name:"spdx-tools validation",src:"pyspdxtools",cells:[["pass","valid"],["pass","valid"]]},
  {name:"sbom-grader (Red Hat guide)",src:"sbomgrader grade",cells:[["fail","C: fails 'All packages have a supplier', 'License list has correct form', 'RPM packages have packageFileName'"],["warn","B: only fails 'All packages have a checksum' (SRPMs and the root have none; expected before build)"]]},
  {name:"mequal, ProdSec-patched policies",src:"mequal-after bundle",cells:[["fail","error=1 (spdx_single_described_root), tip=479"],["pass","tip=5 only"]]},
  {name:"mequal, upstream policies",src:"mequal bundle",cells:[["pass","clean"],["warn","error=318: upstream LPOL3 wants checksums on SRPMs and the root, which the Red Hat guide's SRPM example omits"]]},
  {name:"Trustify ingestion",src:"—",cells:[["nr","not run on this file"],["nr","not run on this file"]]},
  {name:"Conforma",src:"—",cells:[["nr","not run on this file"],["nr","not run on this file"]]}
 ]};
