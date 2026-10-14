D=$(jq -r .digest push-raw.json)
awk '/COSIGN_PUB/{while((getline l < "cosign.pub")>0) print "            " l; next}1' konflux-policy.yaml > policy.yaml
podman run --rm --user 0 --network host -v "$PWD:/w:z" -w /w quay.io/conforma/cli:latest validate image \
  --image localhost:5000/raw/fedora-44-qcow2@$D --public-key cosign.pub --ignore-rekor \
  --policy policy.yaml --info --show-successes --output policy-input=policy-input-raw.json --output text
