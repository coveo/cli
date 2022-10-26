import z from "zod";

const zValidEnvironment = z.object({
  VITE_APP_PLATFORM_URL: z.string(),
  VITE_APP_ORGANIZATION_ID: z.string(),
  VITE_APP_API_KEY: z.string(),
  VITE_APP_USER_EMAIL: z.string(),
});

/**
 * Making sure all environment variables are defined
 *
 * @returns true if the .env file is valid. false otherwise.
 */
export function isEnvValid(
  env: unknown
): env is z.infer<typeof zValidEnvironment> {
  zValidEnvironment.parse(env);
  return true;
}

function getEndpointToLocalServer() {
  return `./token`;
}

export function getTokenEndpoint() {
  return import.meta.env.VITE_APP_TOKEN_ENDPOINT || getEndpointToLocalServer();
}
