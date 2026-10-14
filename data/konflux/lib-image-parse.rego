parse(ref) := d if {
	trimmed_ref := trim_space(ref)

	# Note: This regex is simplified and does not cover all valid hostname cases.
	# It only matches hostnames in the form of <hostname><optional port><optional path>.
	# For example "registry.com", "registry.com/repo", "localhost:5000/repo/subrepo"
	# It does not include all subdomains and does not support Unicode.
	regex.match(`^([A-Za-z0-9.-]+(?::[0-9]+)?)(?:\/.*)?$`, trimmed_ref)

	# a valid repo will contain a /
	contains(trimmed_ref, "/")

	digest_parts := split(trimmed_ref, "@")
