// Hand-transcribed from measured results; every cell cites its source file. "nr" = not run.
window.SCORECARD={
 cols:["Today: Konflux build-vm-image (FCOS container SBOM)","image-builder unpatched","image-builder patched build (CentOS 9 tar)","Patched + mobster fold"],
 rows:[
  {name:"spdx-tools validation",src:"samples/final/eval-final.md; findings.md §7.3",cells:[["pass","valid"],["nr","not run in final eval"],["pass","valid"],["pass","valid"]]},
  {name:"sbom-grader grade",src:"samples/final/eval-final.md; findings.md §5.1",cells:[["fail","F — checksum, supplier, versionInfo, packageFileName, image-purl tag"],["nr","not run"],["pass","A"],["warn","B — only image purl tag (added at release)"]]},
  {name:"CISA 2026 minimum elements",src:"findings.md §5.1, §7.1 (field counts)",cells:[["fail","hash 2/1599, producer 2/1599, no generation context, licenses mostly NOASSERTION"],["nr","not assessed"],["pass","all elements pass"],["nr","not assessed separately (same content)"]]},
  {name:"Red Hat SBOM guide (RPM items)",src:"findings.md §5.1, §7.2",cells:[["fail","missing SHA256, packageFileName, licenseConcluded, SRPM/GENERATED_FROM, full NEVRA"],["nr","not assessed"],["pass","every RPM item passes"],["warn","passes; namespace konflux-ci.dev (open)"]]},
  {name:"Conforma, FCOS production policy: SBOM rules",src:"conforma/results.md; findings.md §5.2",cells:[["warn","all pass; hermeto_attribution_required warns ×571 (effective 2027-01-15)"],["pass","all pass (CentOS 10 sample)"],["nr","raw not attached; tested via mobster fold"],["pass","all pass, no SBOM warnings"]]},
  {name:"Conforma @redhat_security: matches_image",src:"conforma/results.md",cells:[["fail","fails: SBOM names container digest, not disk"],["warn","passes vacuously (name not an image ref); download_location_valid warn ×512"],["nr","not run raw"],["pass","pass"]]},
  {name:"Conforma: faked-provenance baseline",src:"findings.md §5.2",cells:[["warn","9 violations (fcos), same in all cases — from faked provenance"],["warn","9 (same baseline)"],["nr","—"],["warn","9 (same baseline)"]]},
  {name:"mequal (upstream policy)",src:"samples/final/eval-final.md; findings.md §5.1",cells:[["fail","error=1598"],["nr","not run"],["warn","error=79 (LPOL3 on SRPMs/root)"],["warn","error=79"]]},
  {name:"mequal (patched ProdSec policies)",src:"samples/final/eval-final.md",cells:[["fail","error=1598"],["nr","not run"],["pass","tip=5 only"],["pass","tip=5 only"]]},
  {name:"Trustify ingestion",src:"trustify.md; samples/final/trustify-built.md",cells:[["nr","not ingested in this round"],["warn","OK (Fedora container sample); no DESCRIBES root → all 510 RPMs 'described'; LicenseRef warning"],["pass","201; 1 warning (cross-doc build-root ref dropped)"],["pass","201; same 1 warning"]]}
 ]};
