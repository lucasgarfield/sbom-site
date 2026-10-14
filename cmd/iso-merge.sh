# merge the anaconda-tree (installer) and os (payload) SBOMs of one ISO into one ISO SBOM (prototype, jq only)
A=fedora-44-minimal-installer-x86_64.image-anaconda-tree.spdx.json
O=fedora-44-minimal-installer-x86_64.image-os.spdx.json
SHA=$(printf 'placeholder: not a real ISO' | sha256sum | cut -d' ' -f1)   # placeholder: no ISO is built (manifest only)
jq -n --slurpfile a $A --slurpfile o $O --arg sha "$SHA" '
def subroot($d; $id; $p):
  ($d | walk(if . == "SPDXRef-image-root" then $id else . end)) as $d
  | $d | .packages |= map(if .SPDXID == $id then
      .name += "-" + $p | .primaryPackagePurpose = "OPERATING-SYSTEM"
      | .externalRefs |= map(.referenceLocator += "&pipeline=" + $p) else . end);
(subroot($a[0]; "SPDXRef-anaconda-tree"; "anaconda-tree")) as $A
| (subroot($o[0]; "SPDXRef-os"; "os")) as $O
| ($o[0].packages[] | select(.SPDXID == "SPDXRef-image-root")) as $r
| {
  spdxVersion: "SPDX-2.3", dataLicense: "CC0-1.0", SPDXID: "SPDXRef-DOCUMENT",
  name: ($r.name + ".iso"),
  documentNamespace: ("https://osbuild.org/spdxdocs/" + $r.name + ".iso-" + $sha),
  creationInfo: ($o[0].creationInfo | .creators += ["Tool: iso-merge.sh-prototype"]),
  externalDocumentRefs: $o[0].externalDocumentRefs,
  hasExtractedLicensingInfos: ($A.hasExtractedLicensingInfos + $O.hasExtractedLicensingInfos | unique_by(.licenseId)),
  packages: ([$r | .SPDXID = "SPDXRef-image-root" | .packageFileName = $r.name + ".iso"
               | .primaryPackagePurpose = "FILE"
               | .checksums = [{algorithm: "SHA256", checksumValue: $sha}]]
             + ($A.packages + $O.packages | unique_by(.SPDXID))),
  relationships: ([
      {spdxElementId: "SPDXRef-DOCUMENT", relationshipType: "DESCRIBES", relatedSpdxElement: "SPDXRef-image-root"},
      {spdxElementId: "SPDXRef-image-root", relationshipType: "CONTAINS", relatedSpdxElement: "SPDXRef-anaconda-tree"},
      {spdxElementId: "SPDXRef-image-root", relationshipType: "CONTAINS", relatedSpdxElement: "SPDXRef-os"},
      {spdxElementId: "DocumentRef-buildroot-build:SPDXRef-DOCUMENT", relationshipType: "BUILD_TOOL_OF", relatedSpdxElement: "SPDXRef-image-root"}]
    + ([$A.relationships[], $O.relationships[]]
       | map(select(.relationshipType != "DESCRIBES" and .relationshipType != "BUILD_TOOL_OF")) | unique))
}' > iso.spdx.json
jq '{packages: (.packages|length), relationships: (.relationships|length),
     roots: [.packages[] | select(.SPDXID|test("image-root|anaconda-tree|^SPDXRef-os$")) | {SPDXID, name, primaryPackagePurpose}]}' iso.spdx.json
