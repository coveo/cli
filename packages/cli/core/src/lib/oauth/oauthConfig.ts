export interface AuthorizationServiceConfiguration {
  authorizationEndpoint: string;
  revocationEndpoint: string;
  tokenEndpoint: string;
}

export interface ClientConfig {
  client_id: string;
  redirect_uri: string;
  scope: 'full';
}
