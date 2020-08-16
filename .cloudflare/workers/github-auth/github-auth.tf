variable "CLOUDFLARE_ACCOUNT_ID" {
	description = "Your Cloudflare account ID - https://developers.cloudflare.com/workers/quickstart#account-id-and-zone-id"
}

variable "CLOUDFLARE_API_TOKEN" {
	description = "Your Cloudflare API Token - https://dash.cloudflare.com/profile/api-tokens"
}

provider "cloudflare" {
	account_id = var.CLOUDFLARE_ACCOUNT_ID
	api_token  = var.CLOUDFLARE_API_TOKEN
}

resource "cloudflare_workers_kv_namespace" "github-auth-kv" {
	title = "github-auth-kv"
}

resource "cloudflare_worker_script" "default" {
	name    = "github-auth"
	content = file("index.js")

	kv_namespace_binding {
		namespace_id = cloudflare_workers_kv_namespace.github-auth-kv.id
		name         = "PROXY_KV"
	}
}
