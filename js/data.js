// Annotations for the sample SBOM. Plain data; rendered by app.js.
// Keys of NOTES are "logical paths" computed by app.js:
//   top-level key ............ "spdxVersion", "creationInfo.created", "creationInfo.creators[1]"
//   root image package ....... "root.<field>"   (the package the document DESCRIBES)
//   representative RPM ....... "rpm.<field>"    (openssl-libs, chosen because it has an epoch)
//   relationships ............ "rel.CONTAINS.<field>", "rel.DESCRIBES.<field>"
//   array members ............ "[]" (e.g. "rpm.checksums[].algorithm")
// "ghost" notes describe fields the code does NOT emit; they are drawn as dimmed
// placeholder lines and are never part of the SBOM file itself.
(function () {
  const SHA = "d87a70fbd71eccf42a1fc1571a2aca0f332e094a";
  const GH = "https://github.com/lucasgarfield/image-builder/blob/" + SHA + "/";
  const PB = "https://github.com/protobom/protobom/blob/v0.6.2/pkg/native/serializers/serializer_spdx23.go";
  const code = (file, from, to, label) => ({
    label: label || (file + ":" + from + (to ? "-" + to : "")),
    url: GH + file + "#L" + from + (to ? "-L" + to : ""),
  });
  const pb = (from, to, label) => ({
    label: label || ("protobom v0.6.2 serializer_spdx23.go:" + from + (to ? "-" + to : "")),
    url: PB + "#L" + from + (to ? "-L" + to : ""),
  });

  // Requirement sources (all checked to resolve on 2026-11-16).
  const RH = "https://redhatproductsecurity.github.io/security-data-guidelines/";
  const S = {
    rhDoc:      { label: "Red Hat ProdSec, SBOM Details: SBOM Document Structure", url: RH + "sbom-details/#sbom-document-structure" },
    rhPkgs:     { label: "Red Hat ProdSec, SBOM Details: Packages and Relationships", url: RH + "sbom-details/#packages-and-relationships" },
    rhRPM:      { label: "Red Hat ProdSec, SBOM Details: RPM", url: RH + "sbom-details/#rpm" },
    rhArchive:  { label: "Red Hat ProdSec, SBOM Details: Generic archive (zip / tar)", url: RH + "sbom-details/#generic-archive-zip-tar" },
    rhImage:    { label: "Red Hat ProdSec, SBOM Details: Container Image", url: RH + "sbom-details/#container-image" },
    rhProduct:  { label: "Red Hat ProdSec, SBOM Details: Product", url: RH + "sbom-details/#product" },
    rhGrader:   { label: "Red Hat ProdSec, SBOM Details: Compliance Validation (SBOM-Grader)", url: RH + "sbom-details/#compliance-validation" },
    rhPurlRPM:  { label: "Red Hat ProdSec, purl: Identifying RPM packages", url: RH + "purl/#identifying-rpm-packages" },
    rhPurlArch: { label: "Red Hat ProdSec, purl: Red Hat-distributed archives", url: RH + "purl/#red-hat-distributed-archives" },
    rhPurlGen:  { label: "Red Hat ProdSec, purl: Generic components", url: RH + "purl/#generic-components" },
    rhPurlOCI:  { label: "Red Hat ProdSec, purl: Identifying container images", url: RH + "purl/#identifying-container-images" },
    rhBuildRel: { label: "Red Hat ProdSec, SBOM Overview: Build vs Release", url: RH + "sbom/#build-vs-release" },
    rhShallow:  { label: "Red Hat ProdSec, SBOM Overview: Shallow vs Complete", url: RH + "sbom/#shallow-vs-complete" },
    rhOverview: { label: "Red Hat ProdSec, SBOM Overview", url: RH + "sbom/#sbom-overview" },
    repoMap:    { label: "repository-to-cpe.json (ProdSec repository ID mapping)", url: "https://security.access.redhat.com/data/meta/v1/repository-to-cpe.json" },
    rhelSbom:   { label: "Published RHEL 9.6.z product SBOM (security.access.redhat.com)", url: "https://security.access.redhat.com/data/sbom/v1/spdx/rhel-9.6.z.json.bz2" },
    rhSbomIdx:  { label: "Red Hat published SBOMs index (/data/sbom/v1/)", url: "https://security.access.redhat.com/data/sbom/v1/" },
    spdxDoc:    { label: "SPDX 2.3 §6 Document creation information", url: "https://spdx.github.io/spdx-spec/v2.3.1/document-creation-information/" },
    spdxPkg:    { label: "SPDX 2.3 §7 Package information", url: "https://spdx.github.io/spdx-spec/v2.3.1/package-information/" },
    spdxRel:    { label: "SPDX 2.3 §11 Relationships", url: "https://spdx.github.io/spdx-spec/v2.3.1/relationships-between-SPDX-elements/" },
    spdxAnn:    { label: "SPDX 2.3 §12 Annotations", url: "https://spdx.github.io/spdx-spec/v2.3.1/annotations/" },
    purlGeneric:{ label: "purl spec: generic type", url: "https://packageurl.org/docs/purl-spec/types/definitions/generic-definition" },
    purlOCI:    { label: "purl spec: oci type", url: "https://packageurl.org/docs/purl-spec/types/definitions/oci-definition" },
    purlRPM:    { label: "purl spec: rpm type", url: "https://packageurl.org/docs/purl-spec/types/definitions/rpm-definition" },
    konflux:    { label: "Konflux docs: Inspecting artifact SBOMs", url: "https://konflux-ci.dev/docs/metadata/sboms/" },
    mobsterLife:{ label: "Mobster (Konflux) docs: SBOM lifecycle", url: "https://konflux-ci.dev/mobster/sboms/sbom_lifecycle/" },
    mobsterOCI: { label: "Mobster (Konflux) docs: SBOM for OCI artifact", url: "https://konflux-ci.dev/mobster/sboms/oci_artifact/" },
    ecSpdx:     { label: "Conforma policy: SPDX SBOM package (sbom_spdx)", url: "https://conforma.dev/docs/policy/packages/release_sbom_spdx.html" },
    ecRepos:    { label: "Conforma policy: RPM Repos package (rpm_repos)", url: "https://conforma.dev/docs/policy/packages/release_rpm_repos.html" },
    fedoraSPDX: { label: "Fedora Legal: Callaway-to-SPDX migration", url: "https://docs.fedoraproject.org/en-US/legal/update-existing-packages/" },
  };

  // ---------------------------------------------------------------- questions
  const QUESTIONS = [
    {
      id: "Q1",
      title: "How should the disk image (root package) be identified?",
      question: "What purl type, name, version and primaryPackagePurpose does ProdSec want for a disk image (qcow2, raw, vmdk, ISO…)? We found no published Red Hat guidance for disk/VM images.",
      current: "The root package has only name (= document name, e.g. centos-9-qcow2-x86_64), packageFileName and the SHA-256 of the image file. No purl, no versionInfo, no supplier, no primaryPackagePurpose. SBOM-Grader flags all three missing SHOULD fields on packages[0].",
      options: [
        "pkg:generic/<stable-name>@<version>?arch=x86_64, following ProdSec's 'Red Hat-distributed archives' rule (stable name without version or platform; versionInfo = purl version; download_url added at release time).",
        "pkg:oci/<name>@sha256:<digest>?repository_url=…&tag=… if disk images are released as OCI artifacts through Konflux (Mobster oci-artifact shape; Conforma sbom_spdx.matches_image compares the SBOM's image digest with the verified one). The checksum would then be the OCI digest, which is only known after the push.",
        "No purl at build time; add it during release-time augmentation, like container repository_url.",
        "Name/version: who supplies the stable name and the version (image-builder from distro + image type, or the caller, e.g. the compose/release ID)? Purpose: OPERATING-SYSTEM, ARCHIVE, FILE, or none?",
      ],
      fields: ["root.name", "root.@versionInfo", "root.@purl", "root.@primaryPackagePurpose", "name"],
      refs: [S.rhPurlArch, S.rhArchive, S.rhPurlOCI, S.mobsterOCI, S.ecSpdx, S.spdxPkg],
    },
    {
      id: "Q2",
      title: "repository_id on RPM purls: build time or release time?",
      question: "Should image-builder add repository_id to RPM purls, or is it added when the image is released (the way ProdSec describes release-time SBOMs)?",
      current: "RPM purls carry arch and epoch only (TODO at pkg/sbom/purl.go:34). The namespace comes from the RPM Vendor header.",
      options: [
        "image-builder maps each repo's baseurl path to an ID via repository-to-cpe.json. Problems found: 3,336 of 20,478 paths map to more than one ID (e.g. …-eus-rpms vs …-eus-rpms__9_DOT_6); old minors (8.4, 9.0) are not in the file; Satellite/mirror URLs only match on the content/… suffix.",
        "Leave it to a release-time augmentation step, which knows the CDN repos the image ships from.",
        "The caller (composer, Konflux, Koji) passes repo IDs with its repo configs.",
      ],
      fields: ["rpm.externalRefs[].referenceLocator"],
      refs: [S.rhPurlRPM, S.rhRPM, S.repoMap, S.ecRepos, S.mobsterLife],
    },
    {
      id: "Q3",
      title: "Organization creator and root supplier: who sets 'Red Hat'?",
      question: "For Red Hat builds, where should 'Organization: Red Hat' (creator) and 'supplier: Organization: Red Hat' (root package) come from?",
      current: "The library supports an Organization (it adds the creator and the root supplier), but the CLI never sets it. image-builder is an upstream tool also used by non-Red Hat users, so it is not hard-coded.",
      options: [
        "A CLI flag / build-system config set by Red Hat pipelines.",
        "Added during release-time augmentation.",
        "Always derive it from the distro (RHEL → Red Hat). Risky for customer-built RHEL images: is a customer's image 'supplied' by Red Hat?",
      ],
      fields: ["creationInfo.@organization", "root.@supplier"],
      refs: [S.rhDoc, S.rhArchive, S.rhPkgs],
    },
    {
      id: "Q4",
      title: "Supplier and purl namespace for non-Red Hat RPMs",
      question: "Is it right to set supplier only on Red Hat RPMs, and to derive the purl namespace from the Vendor header for everything else?",
      current: "Vendor 'Red Hat, Inc.' → pkg:rpm/redhat/… plus supplier 'Organization: Red Hat'. Other vendors map to centos, fedora, almalinux, rockylinux, oraclelinux, or the lowercased vendor string, with no supplier. This CentOS Stream SBOM therefore has no supplier on any of its 474 RPMs.",
      options: [
        "Keep: supplier only where ProdSec requires it (Red Hat-distributed components).",
        "Set supplier 'Organization: <Vendor>' on every RPM.",
        "Set supplier NOASSERTION when the vendor is not Red Hat.",
      ],
      fields: ["rpm.@supplier", "rpm.externalRefs[].referenceLocator"],
      refs: [S.rhPkgs, S.rhPurlRPM, S.spdxPkg],
    },
    {
      id: "Q5",
      title: "Licenses omitted in the MVP",
      question: "Is an SBOM without license fields acceptable for now, and what should we emit later?",
      current: "No licenseDeclared / licenseConcluded on any package (absent, not NOASSERTION). The RPM License tag is available, but EL9 predates Fedora's July 2022 switch to SPDX expressions, so many tags are legacy Callaway names, not valid SPDX. protobom cannot write hasExtractedLicensingInfos. For comparison, the published RHEL 9.6.z product SBOM has no license field on any of its 46,816 RPM entries.",
      options: [
        "Keep omitting (current).",
        "licenseDeclared only when the tag is a valid SPDX expression; omit otherwise.",
        "Emit NOASSERTION explicitly.",
        "Emit LicenseRef-… with extracted text (needs a post-processing step outside protobom).",
      ],
      fields: ["rpm.@license", "root.@license"],
      refs: [S.rhPkgs, S.rhImage, S.fedoraSPDX, S.rhelSbom, S.spdxPkg],
    },
    {
      id: "Q6",
      title: "documentNamespace: random per document, osbuild.org prefix",
      question: "Is a random namespace (so two builds of the same image never produce byte-identical SBOMs) acceptable, and which prefix should Red Hat builds use?",
      current: "https://osbuild.org/spdxdocs/<name>-<random UUIDv4>. 'created' also changes on every write.",
      options: [
        "Keep random; reproducibility is not a goal for SBOM documents.",
        "Deterministic namespace, e.g. derived from the image SHA-256 and name.",
        "Let the caller choose the prefix: https://www.redhat.com/<DocumentID>.spdx.json or https://security.access.redhat.com/data/sbom/spdx/<DocumentID>.spdx.json for Red Hat builds.",
      ],
      fields: ["documentNamespace"],
      refs: [S.rhDoc, S.spdxDoc],
    },
    {
      id: "Q7",
      title: "RPM checksums: non-SHA-256 repos and header annotations",
      question: "What should happen when a repo publishes only SHA-1/MD5/SHA-512 package checksums, and do you want the sigmd5 / header SHA-256 annotations?",
      current: "One checksum per RPM: the file digest from the repo metadata, in whatever algorithm the repo uses (md5, sha1, sha256, sha384, sha512 accepted). All 474 here are SHA-256. No annotations. The depsolver already returns a header checksum that we don't use.",
      options: [
        "Require SHA-256: refuse --with-sbom (or compute the digest) when the repo has none.",
        "Emit what the repo has (current).",
        "Add 'sigmd5' and header-SHA-256 annotations as in ProdSec's RPM example (SBOM-Grader's rpm_release cookbook checks for sigmd5).",
      ],
      fields: ["rpm.checksums[].algorithm"],
      refs: [S.rhRPM, S.spdxAnn, S.rhGrader],
    },
    {
      id: "Q8",
      title: "Source provenance (SRPMs, upstream sources)",
      question: "Does a disk image SBOM need SRPM packages with GENERATED_FROM, or is the binary RPM purl enough to find each RPM's own component SBOM?",
      current: "Binary RPMs only. No SRPM nodes, no GENERATED_FROM. The source RPM name is available from the depsolver.",
      options: [
        "Shallow: binary RPMs only (current); consumers follow purls to RPM SBOMs.",
        "Add an SRPM package per binary RPM and a GENERATED_FROM edge.",
      ],
      fields: ["rel.CONTAINS.relationshipType"],
      refs: [S.rhRPM, S.rhShallow, S.rhOverview],
    },
    {
      id: "Q9",
      title: "Installer ISOs: flat list vs. installer/payload split",
      question: "Is one flat list of installer-environment and OS-payload RPMs still OK, or should the SBOM separate them?",
      current: "MVP: flat. An image-installer ISO is a package-mode image with one artifact, so --with-sbom lists the union of the anaconda-tree and os payload RPMs, each once. (MVP decision of 2026-11-13, on the basis that the SBOM represents what is on the image; please confirm.)",
      options: [
        "Keep flat (current).",
        "Two intermediate packages (installer environment, OS payload) with CONTAINS edges to their RPMs; an RPM in both gets two edges. Validates as SPDX 2.3; trivy handles only one OS component.",
      ],
      fields: ["rel.CONTAINS.relationshipType"],
      refs: [S.spdxRel, S.rhImage],
    },
    {
      id: "Q10",
      title: "Network installer: only installer RPMs",
      question: "Is it acceptable that a network-installer ISO's SBOM lists only the installer environment, since the OS is fetched at install time?",
      current: "Only the RPMs on the media are listed (there is no OS payload on a network installer).",
      options: ["Accept.", "Add a note/annotation that the installed OS is not covered.", "Refuse --with-sbom for network installers."],
      fields: ["root.name"],
      refs: [S.rhOverview],
    },
    {
      id: "Q11",
      title: "bootc / ostree images: refused for now",
      question: "For bootc and ostree images, is a 'sparse' SBOM that points to the container's or commit's own SBOM the right next step?",
      current: "--with-sbom is refused for bootc and ostree images (task: sbom_unsupported), because the depsolve does not describe their content.",
      options: [
        "Disk image CONTAINS a pkg:oci package pinned to the base container's digest; consumers resolve its SBOM (Konflux publishes one for quay.io/centos-bootc).",
        "Same, plus externalDocumentRefs (needs the container SBOM's namespace and SHA-1 at build time).",
        "Keep refusing.",
      ],
      fields: ["root.name"],
      refs: [S.rhShallow, S.rhPurlOCI, S.spdxDoc],
    },
    {
      id: "Q12",
      title: "Extras and multiple artifacts",
      question: "Images that also export extras (e.g. sysexts) or more than one artifact: separate SBOM per artifact, or none?",
      current: "Only the primary disk export gets an SBOM. --with-extra plus --with-sbom is refused, and builds with more than one output artifact are refused.",
      options: ["One SBOM per exported artifact.", "Primary disk only (current)."],
      fields: ["root.packageFileName"],
      refs: [S.rhArchive],
    },
    {
      id: "Q13",
      title: "Build-time vs release-time: what happens after the build?",
      question: "Which pipeline augments this build-time SBOM (repository_id, purl download_url / repository_url, CPEs, Organization) and publishes it (security.access.redhat.com, TPA, OCI referrer)?",
      current: "image-builder writes a build-time SBOM next to the image. Nothing downstream consumes it yet.",
      options: ["Konflux/Mobster release augmentation.", "A new step in the image release tooling.", "image-builder emits release-time fields when the caller provides them."],
      fields: ["creationInfo.created"],
      refs: [S.rhBuildRel, S.mobsterLife, S.konflux],
    },
  ];

  // -------------------------------------------------------------------- notes
  // status: "ok" = matches published guidance, "info" = no requirement / neutral,
  //         "q" = tied to an open question (q: "Qn").
  const NOTES = {
    "spdxVersion": {
      status: "ok", what: "SPDX 2.3 JSON, written by protobom.",
      code: [code("pkg/sbom/sbom.go", 124, 129, "sbom.go:124-129 Write (FormatSPDX23JSON)"), pb(175)],
      req: [{ src: S.rhDoc, text: "SPDX version 2.3 (minimal document example)." }],
    },
    "dataLicense": {
      status: "ok", what: "Constant set by protobom.",
      code: [pb(176)],
      req: [{ src: S.rhDoc, text: "\"The CC0-1.0 license is required by the SPDX specification.\"" }],
    },
    "SPDXID": {
      status: "ok", what: "Constant set by protobom.",
      code: [pb(177)],
      req: [{ src: S.rhDoc, text: "SPDXID \"must be set to SPDXRef-DOCUMENT\"." }],
    },
    "name": {
      status: "q", q: "Q1",
      what: "The image basename: the default template <distro>-<image type>-<arch>, or --output-name. Same value as the root package name.",
      code: [code("cmd/image-builder/main.go", 126, 131, "main.go:126-131 default name template"), code("cmd/image-builder/sbom.go", 38), code("pkg/sbom/sbom.go", 97)],
      req: [{ src: S.rhDoc, text: "Should describe the main artifact, \"along with a version identifier\"; human-readable only. Automation should use the DESCRIBED package's metadata." }],
    },
    "documentNamespace": {
      status: "q", q: "Q6",
      what: "https://osbuild.org/spdxdocs/<name>-<random UUIDv4>, new for every document.",
      code: [code("pkg/sbom/sbom.go", 131, 140, "sbom.go:131-140 documentNamespace")],
      req: [{ src: S.rhDoc, text: "Must be a valid URI. Red Hat SBOMs can use https://www.redhat.com/[DocumentID].spdx.json or https://security.access.redhat.com/data/sbom/spdx/[DocumentID].spdx.json." }],
    },
    "creationInfo": {
      status: "ok", what: "Built by protobom from the document metadata.",
      code: [pb(182, 196)],
      req: [{ src: S.rhDoc, text: "Must contain at least created and creators." }],
    },
    "creationInfo.licenseListVersion": {
      status: "info", what: "Hard-coded to 3.20 by protobom. Not meaningful here because the document has no license fields.",
      code: [pb(183)],
      req: [{ src: S.spdxDoc, text: "Optional field (§6.7). No ProdSec requirement found." }],
    },
    "creationInfo.creators": {
      status: "q", q: "Q3", what: "Two Tool creators; no Organization creator.",
      code: [pb(184, 221)],
      req: [{ src: S.rhDoc, text: "creators \"must identify the tool and its version\"; \"Organization: Red Hat\" in a separate string." }],
    },
    "creationInfo.creators[0]": {
      status: "ok", what: "protobom always credits itself, with its own module version.",
      code: [pb(184, 191)],
      req: [{ src: S.rhArchive, text: "\"Additional creators are allowed\" (generic archive section)." }],
    },
    "creationInfo.creators[1]": {
      status: "ok",
      what: "image-builder and its version, written as name-version. The version is set at build time (-X main.version); this dev build used `git describe` (v90.0.0-37-gd87a70fbd). An unset version is 'unknown'.",
      code: [code("cmd/image-builder/sbom.go", 31, 35, "cmd/image-builder/sbom.go:31-35 Tool"), code("pkg/sbom/sbom.go", 92), pb(200, 221)],
      req: [{ src: S.rhDoc, text: "Must identify the tool and its version, e.g. \"Tool: SBOMer 1.2.3\"." }],
    },
    "creationInfo.@organization": {
      ghost: true, status: "q", q: "Q3", label: "\"Organization: Red Hat\"",
      what: "Not emitted. sbom.Creator.Organization exists, but the CLI never sets it.",
      code: [code("pkg/sbom/sbom.go", 28, 36, "sbom.go:28-36 Creator"), code("pkg/sbom/sbom.go", 93, 95), code("cmd/image-builder/sbom.go", 29, 36, "cmd/image-builder/sbom.go:29-36 (no Organization)")],
      req: [{ src: S.rhDoc, text: "\"The value Organization: Red Hat included in a separate string. This is required by Red Hat Trusted Profiler Analyser 2 in order to trigger special handling.\"" }],
    },
    "creationInfo.created": {
      status: "ok",
      what: "Set by protobom when the document is written, i.e. after osbuild has finished and the image is hashed (build completion time, UTC).",
      code: [pb(195), code("cmd/image-builder/main.go", 949, 956, "main.go:949-956 SBOM written after the build")],
      req: [{ src: S.rhDoc, text: "UTC timestamps must use the YYYY-MM-DDThh:mm:ssZ format." }],
    },
    "packages": {
      status: "info",
      what: "475 packages: the root image package plus 474 RPMs. The RPMs are the union of the depsolved payload pipelines (buildroot excluded), deduplicated by purl and sorted by NEVRA. Collapsed below: only the root and one RPM are expanded.",
      code: [code("pkg/manifestgen/manifestgen.go", 267, 298, "manifestgen.go:267-298 payloadPackages"), code("pkg/sbom/rpm.go", 22, 42, "rpm.go:22-42 dedupe")],
      req: [{ src: S.rhImage, text: "An image SBOM \"must also list out all the components included in that image\"." }],
    },
    "relationships": {
      status: "ok", what: "474 CONTAINS (image → RPM) and 1 DESCRIBES (document → image). No dependency edges.",
      code: [code("pkg/sbom/sbom.go", 104, 118)],
      req: [{ src: S.rhOverview, text: "A component dependency graph is out of scope; relationships are limited to direct ones such as an image and the packages it includes." }],
    },

    // ---------------------------------------------------------- root image
    "root": {
      status: "q", q: "Q1", what: "The disk image itself. The document DESCRIBES it.",
      code: [code("pkg/sbom/sbom.go", 142, 158, "sbom.go:142-158 imageNode")],
      req: [{ src: S.rhArchive, text: "Closest published shape (generic archive): name, versionInfo, supplier, downloadLocation, packageFileName, purl, SHA-256. No disk/VM image section was found." }],
    },
    "root.name": {
      status: "q", q: "Q1", what: "Image basename, same as the document name. Contains distro version and arch.",
      code: [code("cmd/image-builder/sbom.go", 38), code("pkg/sbom/sbom.go", 148)],
      req: [{ src: S.rhArchive, text: "Generic archive name must be \"a stable component identity\"; \"Never embed the product version in the name\"; \"Platform is not part of the name either.\"" }],
    },
    "root.SPDXID": {
      status: "ok", what: "UUIDv5 of \"image\\n\" + the image SHA-256.",
      code: [code("pkg/sbom/sbom.go", 146), code("pkg/sbom/sbom.go", 160, 165, "sbom.go:160-165 nodeID")],
      req: [{ src: S.rhPkgs, text: "Unique within the document; only used to link relationships." }],
    },
    "root.packageFileName": {
      status: "ok", what: "The file name osbuild wrote (only the primary disk export).",
      code: [code("cmd/image-builder/sbom.go", 39), code("cmd/image-builder/main.go", 949, 952, "main.go:949-952 exactly one artifact")],
      req: [{ src: S.rhArchive, text: "packageFileName is \"the on-disk archive name\"; filename/checksum belong on SPDX fields, not purl qualifiers." }],
    },
    "root.downloadLocation": {
      status: "ok", what: "NOASSERTION: protobom's default when no download URL is set.",
      code: [pb(456, 458)],
      req: [{ src: S.rhArchive, text: "Example uses NOASSERTION; release-time SBOMs \"may set downloadLocation when there is a single canonical URL\"." }],
    },
    "root.filesAnalyzed": {
      status: "ok", what: "false: no file list. protobom sets true only when it has files.",
      code: [pb(544, 550)],
      req: [{ src: S.rhDoc, text: "The files field \"is currently unused\"." }],
    },
    "root.checksums": {
      status: "ok", what: "SHA-256 of the image file as written by osbuild, streamed from disk after the build.",
      code: [code("cmd/image-builder/sbom.go", 26), code("pkg/sbom/sbom.go", 150, 152)],
      req: [{ src: S.rhArchive, text: "\"Minimally, the list of checksums must include the SHA-256 of the archive file itself.\"" }],
    },
    "root.checksums[].algorithm": { status: "ok", what: "Always SHA256 for the image.", code: [code("pkg/sbom/sbom.go", 150, 152)], req: [{ src: S.rhArchive, text: "SHA-256 required." }] },
    "root.checksums[].checksumValue": {
      status: "ok", what: "Real digest of the qcow2 built for this page (not a stand-in). If the qcow2 is later compressed, converted, or pushed as an OCI artifact, the delivered file has a different digest (see Q1).",
      code: [code("cmd/image-builder/sbom.go", 26)], req: [{ src: S.rhArchive, text: "SHA-256 of the file itself." }],
    },
    "root.@versionInfo": {
      ghost: true, status: "q", q: "Q1", label: "\"versionInfo\"",
      what: "Not emitted. image-builder has no image version to put here today.",
      code: [code("pkg/sbom/sbom.go", 38, 50, "sbom.go:38-50 Image (no version)")],
      req: [{ src: S.rhArchive, text: "\"The version must not be omitted\" (generic archive); \"analogous to RPM version-release\"." }, { src: S.rhGrader, text: "SBOM-Grader SHOULD: all packages have a versionInfo (fails on packages[0])." }],
    },
    "root.@purl": {
      ghost: true, status: "q", q: "Q1", label: "\"externalRefs\": [purl]",
      what: "Not emitted. Which purl type fits a disk image is the main open question.",
      code: [code("pkg/sbom/sbom.go", 142, 158)],
      req: [{ src: S.rhPkgs, text: "\"At least one of the references must include a Package URL (purl) unless the object is describing a product.\"" }, { src: S.rhPurlArch, text: "Red Hat archives: pkg:generic/<stable-name>@<version>?download_url=…, optional arch=." }],
    },
    "root.@supplier": {
      ghost: true, status: "q", q: "Q3", label: "\"supplier\"",
      what: "Not emitted. It would be set from Creator.Organization, which the CLI leaves empty.",
      code: [code("pkg/sbom/sbom.go", 154, 156)],
      req: [{ src: S.rhArchive, text: "\"The value Organization: Red Hat must be used for archives distributed by Red Hat.\"" }],
    },
    "root.@primaryPackagePurpose": {
      ghost: true, status: "q", q: "Q1", label: "\"primaryPackagePurpose\"",
      what: "Not emitted. protobom writes it only if the node has a PrimaryPurpose.",
      code: [pb(402, 436)],
      req: [{ src: S.spdxPkg, text: "Optional (§7.24). Values include OPERATING-SYSTEM, CONTAINER, ARCHIVE, FILE, INSTALL. No ProdSec guidance found for disk images." }],
    },
    "root.@license": {
      ghost: true, status: "q", q: "Q5", label: "\"licenseConcluded\" / \"licenseDeclared\"",
      what: "Not emitted.",
      code: [code("pkg/sbom/sbom.go", 142, 158)],
      req: [{ src: S.rhImage, text: "For container images, licensing \"should in most cases be set to NOASSERTION\" because it belongs to the contained components." }],
    },

    // ---------------------------------------------------------- representative RPM
    "rpm": {
      status: "info", what: "One RPM, shown expanded (openssl-libs, chosen because it has an epoch). All 474 RPMs have the same shape; 5 lack homepage because their RPM has no URL tag.",
      code: [code("pkg/sbom/rpm.go", 44, 74, "rpm.go:44-74 rpmNode")],
      req: [{ src: S.rhRPM, text: "ProdSec RPM package example (openssl-libs)." }],
    },
    "rpm.name": { status: "ok", what: "RPM Name.", code: [code("pkg/sbom/rpm.go", 61)], req: [{ src: S.rhPkgs, text: "Recommended to use the purl name." }] },
    "rpm.SPDXID": { status: "ok", what: "UUIDv5 of the purl, so the same RPM gets the same ID in every document.", code: [code("pkg/sbom/rpm.go", 59), code("pkg/sbom/sbom.go", 160, 165)], req: [{ src: S.rhPkgs, text: "Unique within the document; only used to link relationships." }] },
    "rpm.versionInfo": { status: "ok", what: "version-release. Epoch is not included here; it goes in the purl qualifier.", code: [code("pkg/sbom/rpm.go", 62)], req: [{ src: S.rhRPM, text: "Example: \"versionInfo\": \"3.0.7-18.el9_2\"." }] },
    "rpm.packageFileName": { status: "ok", what: "name-version-release.arch.rpm (no epoch).", code: [code("pkg/sbom/rpm.go", 117, 120)], req: [{ src: S.rhRPM, text: "Example includes packageFileName \"openssl-libs-3.0.7-18.el9_2.aarch64.rpm\"." }] },
    "rpm.downloadLocation": { status: "ok", what: "NOASSERTION. (The old osbuild SBOM used a mirror URL.)", code: [pb(456, 458)], req: [{ src: S.rhRPM, text: "\"For binary RPM packages, downloadLocation is NOASSERTION.\"" }] },
    "rpm.filesAnalyzed": { status: "ok", what: "false: no per-file listing.", code: [pb(544, 550)], req: [{ src: S.rhOverview, text: "Complete file listings per component are out of scope." }] },
    "rpm.checksums": {
      status: "q", q: "Q7", what: "RPM file digest from the repository metadata (as returned by the depsolver).",
      code: [code("pkg/sbom/rpm.go", 76, 96, "rpm.go:76-96 packageHashes"), code("pkg/depsolvednf/v2.go", 478, 482)],
      req: [{ src: S.rhRPM, text: "\"Minimally, the list of checksums must include the SHA256 checksum of the RPM file\"; other checksums as annotations." }],
    },
    "rpm.checksums[].algorithm": {
      status: "q", q: "Q7", what: "Whatever the repo publishes; md5, sha1, sha256, sha384 and sha512 are accepted. SHA256 for all 474 here.",
      code: [code("pkg/sbom/rpm.go", 98, 115, "rpm.go:98-115 hashAlgorithm")],
      req: [{ src: S.rhRPM, text: "SHA256 required." }],
    },
    "rpm.checksums[].checksumValue": { status: "ok", what: "Lowercase hex, length checked against the algorithm.", code: [code("pkg/sbom/rpm.go", 91, 95)], req: [{ src: S.rhRPM, text: "Checksum of the RPM file itself." }] },
    "rpm.homepage": { status: "info", what: "RPM URL tag. Omitted when the RPM has none.", code: [code("pkg/sbom/rpm.go", 64)], req: [{ src: S.spdxPkg, text: "Optional (§7.11). Not in ProdSec's binary RPM example." }] },
    "rpm.externalRefs": { status: "ok", what: "Exactly one purl per RPM.", code: [code("pkg/sbom/rpm.go", 66, 68)], req: [{ src: S.rhPkgs, text: "At least one purl. An RPM in several repos gets one purl per repo_id (differing only in qualifiers)." }] },
    "rpm.externalRefs[].referenceCategory": { status: "ok", what: "PACKAGE-MANAGER (protobom mapping of a purl identifier).", code: [pb(475, 495)], req: [{ src: S.rhRPM, text: "Same as ProdSec example." }] },
    "rpm.externalRefs[].referenceType": { status: "ok", what: "purl.", code: [pb(475, 495)], req: [{ src: S.rhRPM, text: "Same as ProdSec example." }] },
    "rpm.externalRefs[].referenceLocator": {
      status: "q", q: "Q2",
      what: "pkg:rpm/<namespace>/<name>@<version>-<release>?arch=…[&epoch=…]. Namespace from the Vendor header (here 'CentOS' → centos). No repository_id, no repository_url, no distro.",
      code: [code("pkg/sbom/purl.go", 32, 46, "purl.go:32-46 rpmPURL"), code("pkg/sbom/purl.go", 34, null, "purl.go:34 TODO repository_id"), code("pkg/sbom/purl.go", 11, 30, "purl.go:11-30 vendor → namespace")],
      req: [
        { src: S.rhPurlRPM, text: "Namespace redhat for Red Hat RPMs; epoch as its own qualifier; repository_id instead of repository_url; no distro qualifier." },
        { src: S.rhRPM, text: "\"repository download locations are represented via repository_id purl qualifiers in release-time SBOMs\"." },
      ],
    },
    "rpm.@supplier": {
      ghost: true, status: "q", q: "Q4", label: "\"supplier\"",
      what: "Not emitted for this CentOS RPM. Set to 'Organization: Red Hat' only when the vendor maps to the redhat namespace, so a RHEL image gets it on its Red Hat RPMs.",
      code: [code("pkg/sbom/rpm.go", 70, 72)],
      req: [{ src: S.rhPkgs, text: "\"The value Organization: Red Hat must be used for all components that are distributed by Red Hat.\"" }],
    },
    "rpm.@license": {
      ghost: true, status: "q", q: "Q5", label: "\"licenseConcluded\" / \"licenseDeclared\"",
      what: "Not emitted (MVP). sbom.Package does not carry the License tag.",
      code: [code("pkg/sbom/package.go", 13, 23, "package.go:13-23 sbom.Package")],
      req: [{ src: S.rhPkgs, text: "licenseConcluded: \"If during the build, this information cannot be determined, the value NOASSERTION should be used.\"" }, { src: S.rhelSbom, text: "Observed: no license fields on RPM entries in the RHEL 9.6.z product SBOM." }],
    },
    "rpm.@annotations": {
      ghost: true, status: "q", q: "Q7", label: "\"annotations\" (sigmd5, header SHA-256)",
      what: "Not emitted. The depsolver returns a header checksum that is currently dropped.",
      code: [code("pkg/depsolvednf/v2.go", 68, 69)],
      req: [{ src: S.rhRPM, text: "RPM example annotates \"sigmd5: …\"; other checksums \"should be specified as annotations\"." }],
    },
    "rpm.@srpm": {
      ghost: true, status: "q", q: "Q8", label: "SRPM package + GENERATED_FROM",
      what: "Not emitted. The source RPM name is in the depsolve result but not in sbom.Package.",
      code: [code("pkg/depsolvednf/v2.go", 80)],
      req: [{ src: S.rhRPM, text: "\"SRPMs should be represented as a separate package object in an SBOM\", linked with GENERATED_FROM." }],
    },

    // ---------------------------------------------------------- relationships
    "rel.CONTAINS": { status: "ok", what: "Image CONTAINS RPM, one edge per RPM. Flat: no installer/payload split (Q9).", code: [code("pkg/sbom/sbom.go", 111, 118)], req: [{ src: S.rhImage, text: "List all components and \"create relationships to the architecture-specific image that they are included in\" (CONTAINS)." }] },
    "rel.CONTAINS.spdxElementId": { status: "ok", what: "The root image package.", code: [code("pkg/sbom/sbom.go", 115)], req: [{ src: S.spdxRel, text: "§11.1" }] },
    "rel.CONTAINS.relatedSpdxElement": { status: "ok", what: "The RPM package.", code: [code("pkg/sbom/sbom.go", 116)], req: [{ src: S.spdxRel, text: "§11.1" }] },
    "rel.CONTAINS.relationshipType": { status: "q", q: "Q8", what: "CONTAINS. The only edge type to RPMs: no DEPENDS_ON (out of scope per ProdSec), no GENERATED_FROM to SRPMs.", code: [code("pkg/sbom/sbom.go", 113, 117)], req: [{ src: S.rhImage, text: "CONTAINS from the image to each included package." }] },
    "rel.DESCRIBES": { status: "ok", what: "Document DESCRIBES the image. protobom writes one for each root node; there is exactly one.", code: [code("pkg/sbom/sbom.go", 105), pb(261, 270)], req: [{ src: S.rhArchive, text: "\"The document must DESCRIBES this archive package, and the package must also appear in packages[].\"" }] },
    "rel.DESCRIBES.spdxElementId": { status: "ok", what: "SPDXRef-DOCUMENT.", code: [pb(261, 270)], req: [{ src: S.spdxRel, text: "§11.1" }] },
    "rel.DESCRIBES.relatedSpdxElement": { status: "ok", what: "The root image package.", code: [code("pkg/sbom/sbom.go", 105)], req: [{ src: S.spdxRel, text: "§11.1" }] },
    "rel.DESCRIBES.relationshipType": { status: "ok", what: "DESCRIBES (there is no documentDescribes array; both are valid in SPDX 2.3).", code: [pb(265)], req: [{ src: S.rhArchive, text: "Document DESCRIBES the main package." }] },
  };

  // Where ghost (not emitted) lines are drawn: after the last real member of these objects.
  const GHOSTS = {
    "creationInfo.creators": ["creationInfo.@organization"],
    "root": ["root.@versionInfo", "root.@supplier", "root.@purl", "root.@primaryPackagePurpose", "root.@license"],
    "rpm": ["rpm.@supplier", "rpm.@license", "rpm.@annotations", "rpm.@srpm"],
  };

  const SOURCES = S;
  window.SBOM_PAGE = { SHA, GH, QUESTIONS, NOTES, GHOSTS, SOURCES, REP_RPM: "openssl-libs" };
})();
