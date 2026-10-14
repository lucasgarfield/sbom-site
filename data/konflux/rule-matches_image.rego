
# METADATA
# title: Matches image
# description: Check the SPDX SBOM targets the image being validated.
# custom:
#   short_name: matches_image
#   failure_msg: Image digest in the SBOM, %q, is not as expected, %q
#   solution: >-
#     The SPDX SBOM associated with the image describes a different image.
#     Verify the integrity of the build system.
#   collections:
#   - redhat_security
#
deny contains result if {
	some s in sbom.spdx_sboms
	sbom_image := image.parse(s.name)
	expected_image := image.parse(input.image.ref)
	sbom_image.digest != expected_image.digest
	result := metadata.result_helper(rego.metadata.chain(), [sbom_image.digest, expected_image.digest])
}
