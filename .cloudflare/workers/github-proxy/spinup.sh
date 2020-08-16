set -eux

SCRIPT_NAME=github-proxy

curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/$TF_VAR_CLOUDFLARE_ACCOUNT_ID/workers/scripts/$SCRIPT_NAME" \
	-H "Authorization: Bearer $TF_VAR_CLOUDFLARE_API_TOKEN"

EXISTING_KV=`wrangler kv:namespace list | jq -r '.[] | select(.title == "github-proxy-kv").id'`;

echo $EXISTING_KV;

# terraform init .;
yes | wrangler kv:namespace delete --namespace-id=$EXISTING_KV;
yes | wrangler kv:namespace delete --namespace-id=$EXISTING_KV;

terraform 0.13upgrade --yes .;

terraform refresh .
terraform plan .
terraform apply --auto-approve .
