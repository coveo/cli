provider "coveo" {
  env    = var.env
  region = var.region
  provider_credentials_region = var.region
}

resource coveo_oauth2_client "oauth2_cli_client" {
  client_id                     = "cli"
  display_name                  = "Coveo CLI"
  client_secret                 = "cli"
  auto_approve_scopes           = ["full"]
  scopes                        = ["full"]
  authorized_grant_types        = ["authorization_code"]
  registered_redirect_uri       = ["http://127.0.0.1:32111"]
  access_token_validity_seconds = 86400
}
