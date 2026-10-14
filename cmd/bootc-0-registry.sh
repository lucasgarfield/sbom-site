# what quay.io/coreos-devel/fedora-coreos:rawhide publishes: index -> amd64 manifest, cosign .sbom tags, OCI referrers
REF=quay.io/coreos-devel/fedora-coreos
S="podman run --rm --network host quay.io/skopeo/stable:latest"
O="podman run --rm --network host ghcr.io/oras-project/oras:v1.2.3"
IDX=sha256:$($S inspect --raw docker://$REF:rawhide | sha256sum | cut -d' ' -f1)
AMD=$($S inspect --raw docker://$REF:rawhide | jq -r '.manifests[]|select(.platform.architecture=="amd64").digest')
echo "index $IDX"; echo "amd64 $AMD"
for d in $IDX $AMD; do
  echo "\$ skopeo inspect --raw docker://$REF:${d/:/-}.sbom"
  $S inspect --raw docker://$REF:${d/:/-}.sbom | jq -c '{layers:[.layers[]|{mediaType,size}]}'
  echo "\$ oras discover $REF@$d   # OCI referrers"
  $O discover --format json $REF@$d | jq -c '[.manifests[]? | .artifactType // .mediaType]'
done
