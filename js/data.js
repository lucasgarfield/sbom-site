// Field notes for the sample SBOM. Keys are logical paths computed by app.js:
//   top-level "name", "creationInfo.created", "creationInfo.creators[1]";
//   "root.<field>" = the disk image package; "rpm.<field>" = first RPM (packages[1]);
//   "rel.CONTAINS.<field>", "rel.DESCRIBES.<field>"; "[]" = array member.
(function () {
  const RH = "https://redhatproductsecurity.github.io/security-data-guidelines/";
  const S = {
    rhDoc:     { label: "Red Hat ProdSec, SBOM Details: SBOM Document Structure", url: RH + "sbom-details/#sbom-document-structure" },
    rhPkgs:    { label: "Red Hat ProdSec, SBOM Details: Packages and Relationships", url: RH + "sbom-details/#packages-and-relationships" },
    rhRPM:     { label: "Red Hat ProdSec, SBOM Details: RPM", url: RH + "sbom-details/#rpm" },
    rhArchive: { label: "Red Hat ProdSec, SBOM Details: Generic archive (zip / tar)", url: RH + "sbom-details/#generic-archive-zip-tar" },
    rhImage:   { label: "Red Hat ProdSec, SBOM Details: Container Image", url: RH + "sbom-details/#container-image" },
    rhPurlArch:{ label: "Red Hat ProdSec, purl: Red Hat-distributed archives", url: RH + "purl/#red-hat-distributed-archives" },
    rhPurlRPM: { label: "Red Hat ProdSec, purl: Identifying RPM packages", url: RH + "purl/#identifying-rpm-packages" },
    rhOverview:{ label: "Red Hat ProdSec, SBOM Overview", url: RH + "sbom/#sbom-overview" },
    spdxDoc:   { label: "SPDX 2.3 §6 Document creation information", url: "https://spdx.github.io/spdx-spec/v2.3.1/document-creation-information/" },
    spdxPkg:   { label: "SPDX 2.3 §7 Package information", url: "https://spdx.github.io/spdx-spec/v2.3.1/package-information/" },
    spdxRel:   { label: "SPDX 2.3 §11 Relationships", url: "https://spdx.github.io/spdx-spec/v2.3.1/relationships-between-SPDX-elements/" },
  };
  const r = (src, text) => ({ src, text });

  const NOTES = {
    "spdxVersion": { what: "The document is SPDX 2.3, JSON format.", req: [r(S.rhDoc, "SPDX version 2.3 (minimal document example).")] },
    "dataLicense": { what: "License of the SBOM document itself.", req: [r(S.rhDoc, "\"The CC0-1.0 license is required by the SPDX specification.\"")] },
    "SPDXID": { what: "Identifier of the document.", req: [r(S.rhDoc, "SPDXID \"must be set to SPDXRef-DOCUMENT\".")] },
    "name": { what: "Document name: the image name, <distro>-<image type>-<architecture> by default. Same as the image package name.", req: [r(S.rhDoc, "Should describe the main artifact, \"along with a version identifier\"; human-readable only. Automation should use the DESCRIBED package's metadata.")] },
    "documentNamespace": { what: "Unique URI for this document: https://osbuild.org/spdxdocs/<name>-<random UUID>. A new UUID is generated for every document.", req: [r(S.rhDoc, "Must be a valid URI. Red Hat SBOMs can use https://www.redhat.com/[DocumentID].spdx.json or https://security.access.redhat.com/data/sbom/spdx/[DocumentID].spdx.json.")] },
    "creationInfo": { what: "Who created the document and when.", req: [r(S.rhDoc, "Must contain at least created and creators.")] },
    "creationInfo.licenseListVersion": { what: "SPDX license list version. The document contains no license fields.", req: [r(S.spdxDoc, "Optional field (§6.7). No ProdSec requirement found.")] },
    "creationInfo.creators": { what: "Tools that created the document. There is no Organization entry.", req: [r(S.rhDoc, "creators \"must identify the tool and its version\"; \"Organization: Red Hat\" in a separate string, \"required by Red Hat Trusted Profiler Analyser 2 in order to trigger special handling.\"")] },
    "creationInfo.creators[0]": { what: "The SBOM library used by image-builder, with its version.", req: [r(S.rhArchive, "\"Additional creators are allowed.\"")] },
    "creationInfo.creators[1]": { what: "image-builder and its version (this sample was built from a development snapshot).", req: [r(S.rhDoc, "Must identify the tool and its version, e.g. \"Tool: SBOMer 1.2.3\".")] },
    "creationInfo.created": { what: "When the SBOM was written, in UTC, right after the image build finished.", req: [r(S.rhDoc, "UTC timestamps must use the YYYY-MM-DDThh:mm:ssZ format.")] },
    "packages": { what: "475 packages: the disk image itself plus the 474 RPMs installed in it, each listed once. Build-only packages are not included. Only the image and the first RPM are expanded here.", req: [r(S.rhImage, "An image SBOM \"must also list out all the components included in that image\".")] },
    "relationships": { what: "474 CONTAINS (image → RPM) and 1 DESCRIBES (document → image). No dependency relationships between RPMs.", req: [r(S.rhOverview, "A component dependency graph is out of scope; relationships are limited to direct ones such as an image and the packages it includes.")] },

    "root": { what: "The disk image (qcow2). This is the package the document DESCRIBES. It has no purl, versionInfo or supplier.", req: [r(S.rhArchive, "No disk/VM image section found. Closest published shape (generic archive): name, versionInfo, supplier, downloadLocation, packageFileName, purl, SHA-256.")] },
    "root.name": { what: "Image name: <distro>-<image type>-<architecture>. Includes the distro version and the architecture.", req: [r(S.rhArchive, "Generic archive name must be \"a stable component identity\"; \"Never embed the product version in the name\"; \"Platform is not part of the name either.\"")] },
    "root.SPDXID": { what: "ID of the image within this document, derived from the image checksum.", req: [r(S.rhPkgs, "Unique within the document; only used to link relationships.")] },
    "root.packageFileName": { what: "File name of the disk image.", req: [r(S.rhArchive, "packageFileName is \"the on-disk archive name\"; filename and checksum belong on SPDX fields, not purl qualifiers.")] },
    "root.downloadLocation": { what: "NOASSERTION: no download location is known at build time.", req: [r(S.rhArchive, "Example uses NOASSERTION; release-time SBOMs \"may set downloadLocation when there is a single canonical URL\".")] },
    "root.filesAnalyzed": { what: "false: individual files inside the image are not listed.", req: [r(S.rhDoc, "The files field \"is currently unused\".")] },
    "root.checksums": { what: "Checksum of the disk image file.", req: [r(S.rhArchive, "\"Minimally, the list of checksums must include the SHA-256 of the archive file itself.\"")] },
    "root.checksums[].algorithm": { what: "SHA-256.", req: [r(S.rhArchive, "SHA-256 required.")] },
    "root.checksums[].checksumValue": { what: "SHA-256 of the qcow2 file exactly as built. This is the real digest of the image built for this sample.", req: [r(S.rhArchive, "SHA-256 of the file itself.")] },

    "rpm": { what: "The first RPM in the package list, shown as an example. All 474 RPMs have the same fields; a few have no homepage. CentOS RPMs carry no supplier; Red Hat RPMs get \"Organization: Red Hat\".", req: [r(S.rhRPM, "ProdSec RPM package example.")] },
    "rpm.name": { what: "RPM name.", req: [r(S.rhPkgs, "Recommended to use the purl name.")] },
    "rpm.SPDXID": { what: "ID of the RPM within this document, derived from its purl.", req: [r(S.rhPkgs, "Unique within the document; only used to link relationships.")] },
    "rpm.versionInfo": { what: "RPM version-release. The epoch is in the purl, not here.", req: [r(S.rhRPM, "Example: \"versionInfo\": \"3.0.7-18.el9_2\".")] },
    "rpm.packageFileName": { what: "RPM file name: name-version-release.arch.rpm.", req: [r(S.rhRPM, "Example includes packageFileName \"openssl-libs-3.0.7-18.el9_2.aarch64.rpm\".")] },
    "rpm.downloadLocation": { what: "NOASSERTION.", req: [r(S.rhRPM, "\"For binary RPM packages, downloadLocation is NOASSERTION.\"")] },
    "rpm.filesAnalyzed": { what: "false: files inside the RPM are not listed.", req: [r(S.rhOverview, "Complete file listings per component are out of scope.")] },
    "rpm.checksums": { what: "Checksum of the RPM file, as published in the repository metadata.", req: [r(S.rhRPM, "\"Minimally, the list of checksums must include the SHA256 checksum of the RPM file\"; other checksums as annotations.")] },
    "rpm.checksums[].algorithm": { what: "The algorithm the repository publishes. SHA-256 for all RPMs in this sample.", req: [r(S.rhRPM, "SHA256 required.")] },
    "rpm.checksums[].checksumValue": { what: "Digest of the RPM file, lowercase hex.", req: [r(S.rhRPM, "Checksum of the RPM file itself.")] },
    "rpm.homepage": { what: "Upstream project URL from the RPM header.", req: [r(S.spdxPkg, "Optional (§7.11). Not in ProdSec's binary RPM example.")] },
    "rpm.externalRefs": { what: "One purl per RPM.", req: [r(S.rhPkgs, "At least one purl. An RPM in several repositories gets one purl per repository_id, differing only in qualifiers.")] },
    "rpm.externalRefs[].referenceCategory": { what: "PACKAGE-MANAGER.", req: [r(S.rhRPM, "Same as ProdSec example.")] },
    "rpm.externalRefs[].referenceType": { what: "purl.", req: [r(S.rhRPM, "Same as ProdSec example.")] },
    "rpm.externalRefs[].referenceLocator": { what: "pkg:rpm/<vendor>/<name>@<version>-<release>?arch=…&epoch=… (epoch only when non-zero). The namespace comes from the RPM vendor: centos here, redhat for Red Hat RPMs. No repository_id qualifier.", req: [r(S.rhPurlRPM, "Namespace redhat for Red Hat RPMs; epoch as its own qualifier; repository_id instead of repository_url; no distro qualifier."), r(S.rhRPM, "\"repository download locations are represented via repository_id purl qualifiers in release-time SBOMs\".")] },

    "rel.CONTAINS": { what: "The image CONTAINS this RPM. One such relationship per RPM.", req: [r(S.rhImage, "List all components and \"create relationships to the architecture-specific image that they are included in\" (CONTAINS).")] },
    "rel.CONTAINS.spdxElementId": { what: "The disk image.", req: [r(S.spdxRel, "§11.1")] },
    "rel.CONTAINS.relatedSpdxElement": { what: "The RPM (here the first RPM in the list).", req: [r(S.spdxRel, "§11.1")] },
    "rel.CONTAINS.relationshipType": { what: "CONTAINS.", req: [r(S.rhImage, "CONTAINS from the image to each included package.")] },
    "rel.DESCRIBES": { what: "The document DESCRIBES the disk image.", req: [r(S.rhArchive, "\"The document must DESCRIBES this archive package, and the package must also appear in packages[].\"")] },
    "rel.DESCRIBES.spdxElementId": { what: "The document.", req: [r(S.spdxRel, "§11.1")] },
    "rel.DESCRIBES.relatedSpdxElement": { what: "The disk image package.", req: [r(S.spdxRel, "§11.1")] },
    "rel.DESCRIBES.relationshipType": { what: "DESCRIBES.", req: [r(S.rhArchive, "Document DESCRIBES the main package.")] },

    // Fields NOT in the SBOM, drawn as dimmed lines in the viewer only.
    "creationInfo.@organization": { ghost: true, label: "\"Organization: Red Hat\"", what: "Not in the SBOM: there is no Organization creator.", req: [r(S.rhDoc, "\"The value Organization: Red Hat included in a separate string. This is required by Red Hat Trusted Profiler Analyser 2 in order to trigger special handling.\"")] },
    "root.@versionInfo": { ghost: true, label: "\"versionInfo\"", what: "Not in the SBOM: the disk image has no version.", req: [r(S.rhArchive, "\"The version must not be omitted\" (generic archive); \"analogous to RPM version-release\".")] },
    "root.@supplier": { ghost: true, label: "\"supplier\"", what: "Not in the SBOM: the disk image has no supplier.", req: [r(S.rhArchive, "\"The value Organization: Red Hat must be used for archives distributed by Red Hat.\"")] },
    "root.@purl": { ghost: true, label: "\"externalRefs\": [purl]", what: "Not in the SBOM: the disk image has no purl. No published Red Hat guidance was found on which purl type to use for a disk image.", req: [r(S.rhPkgs, "\"At least one of the references must include a Package URL (purl) unless the object is describing a product.\""), r(S.rhPurlArch, "Red Hat archives: pkg:generic/<stable-name>@<version>?download_url=…, optional arch=.")] },
    "root.@primaryPackagePurpose": { ghost: true, label: "\"primaryPackagePurpose\"", what: "Not in the SBOM: no purpose is given for the disk image.", req: [r(S.spdxPkg, "Optional (§7.24). Values include OPERATING-SYSTEM, CONTAINER, ARCHIVE, FILE, INSTALL. No ProdSec guidance found for disk images.")] },
    "root.@license": { ghost: true, label: "\"licenseConcluded\" / \"licenseDeclared\"", what: "Not in the SBOM: no license fields on the disk image.", req: [r(S.rhImage, "For container images, licensing \"should in most cases be set to NOASSERTION\" because it belongs to the contained components.")] },
    "rpm.@supplier": { ghost: true, label: "\"supplier\"", what: "Not in the SBOM for this CentOS RPM. RPMs from Red Hat get \"Organization: Red Hat\".", req: [r(S.rhPkgs, "\"The value Organization: Red Hat must be used for all components that are distributed by Red Hat.\"")] },
    "rpm.@license": { ghost: true, label: "\"licenseConcluded\" / \"licenseDeclared\"", what: "Not in the SBOM: no license fields on RPMs.", req: [r(S.rhPkgs, "licenseConcluded: \"If during the build, this information cannot be determined, the value NOASSERTION should be used.\"")] },
    "rpm.@annotations": { ghost: true, label: "\"annotations\" (sigmd5, header SHA-256)", what: "Not in the SBOM: no RPM header checksums.", req: [r(S.rhRPM, "RPM example annotates \"sigmd5: …\"; other checksums \"should be specified as annotations\".")] },
    "rpm.@srpm": { ghost: true, label: "SRPM package + GENERATED_FROM", what: "Not in the SBOM: source RPMs are not listed.", req: [r(S.rhRPM, "\"SRPMs should be represented as a separate package object in an SBOM\", linked with GENERATED_FROM.")] },
  };
  const GHOSTS = {
    "creationInfo.creators": ["creationInfo.@organization"],
    "root": ["root.@versionInfo", "root.@supplier", "root.@purl", "root.@primaryPackagePurpose", "root.@license"],
    "rpm": ["rpm.@supplier", "rpm.@license", "rpm.@annotations", "rpm.@srpm"],
  };

  // Open questions for ProdSec, one card per field (keyed by field path).
  const QCARDS = {
    "creationInfo.@organization": { title: "Should the SBOM name Red Hat as a creator?",
      text: "The SBOM lists only the tools that created it; there is no Organization creator. ProdSec guidance asks for \u201cOrganization: Red Hat\u201d in Red Hat SBOMs, and image-builder is also used outside Red Hat. How should an SBOM from a Red Hat build be marked as created by Red Hat?" },
    "creationInfo.created": { title: "Is a build-time SBOM what ProdSec expects?",
      text: "This timestamp is when the image build finished: the SBOM is written at build time, before the image is released. Release details such as repository IDs, download locations and product CPEs are not known at that point. Should a later release step add them, or does ProdSec expect them in this SBOM?" },
    "root.name": { title: "What stable name should the disk image package carry?",
      text: "The image package is named after the image: distro, image type and architecture (centos-9-qcow2-x86_64). ProdSec's archive guidance asks for a stable name without the product version or platform. What name should a disk image carry so it stays the same across releases and architectures?" },
    "root.@versionInfo": { title: "What version should a disk image carry, and who supplies it?",
      text: "The image package has no versionInfo. A disk image has no version of its own today; the closest values are the distro release and the build or compose ID. Which version does ProdSec want here, and should the system that requests the build provide it?" },
    "root.@purl": { title: "Which purl should identify a disk image?",
      text: "The image package has no purl, so it does not meet ProdSec's \u201cat least one purl\u201d rule. We found no Red Hat guidance on purls for disk or VM images. Which purl type and form should a qcow2, raw image or ISO use?" },
    "root.@primaryPackagePurpose": { title: "Which primaryPackagePurpose fits a disk image?",
      text: "The image package has no primaryPackagePurpose. SPDX offers values such as OPERATING-SYSTEM, ARCHIVE, FILE and INSTALL. Which value, if any, does ProdSec want for disk images and installer ISOs?" },
    "root.@supplier": { title: "Should the disk image name Red Hat as its supplier?",
      text: "The image package has no supplier. ProdSec guidance requires \u201cOrganization: Red Hat\u201d on components Red Hat distributes. Should every disk image built from RHEL content carry it, or only images that Red Hat itself ships?" },
    "root.@license": { title: "Does the disk image package need a license field?",
      text: "The image package has no license field. For container images, ProdSec guidance says licensing should usually be NOASSERTION, because licenses belong to the packages inside. Should a disk image state NOASSERTION, or can the field stay absent?" },
    "rpm.externalRefs[].referenceLocator": { title: "Can disk image SBOMs leave out repository_id?",
      text: "This purl carries arch and epoch, but no repository_id. Red Hat's build-time RPM SBOMs don't carry it either; it's only added at release time, when the advisory ships. Adding it at build time would mean mapping each repository URL to an ID through repository-to-cpe.json, and that mapping is ambiguous: 3,336 of its 20,478 paths map to more than one ID. Is it acceptable to leave repository_id out of disk image SBOMs?" },
    "rpm.@supplier": { title: "Should RPMs from other vendors have a supplier?",
      text: "This CentOS Stream RPM has no supplier; only RPMs from Red Hat get \u201cOrganization: Red Hat\u201d. ProdSec guidance only covers components Red Hat distributes. Should RPMs from other vendors (CentOS, Fedora, third-party repositories) name a supplier?" },
    "rpm.@license": { title: "Can RPM licenses be left out for now?",
      text: "No RPM in this SBOM has a license field. Many RHEL 9 RPM license tags use legacy Fedora (Callaway) names, which are not valid SPDX expressions. Is leaving licenses out acceptable for now?" },
    "rpm.@annotations": { title: "Are RPM header checksums needed?",
      text: "Each RPM has one checksum: the SHA-256 of the RPM file. ProdSec's RPM example also carries the signature header MD5 (sigmd5) and the header SHA-256 as annotations. Does ProdSec need these in disk image SBOMs?" },
    "rpm.@srpm": { title: "Should the SBOM list source RPMs?",
      text: "The SBOM lists only the binary RPMs installed in the image, without their source RPMs. ProdSec guidance says SRPMs should be separate packages linked with GENERATED_FROM. Is that needed in a disk image SBOM, or is the binary RPM's purl enough to find its sources?" },
  };
  window.SBOM_PAGE = { NOTES, GHOSTS, QCARDS };
})();
