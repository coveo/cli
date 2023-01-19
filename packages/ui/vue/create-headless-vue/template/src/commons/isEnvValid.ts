import z from "zod";

const zValidEnvironment = z.object({
  VITE_APP_PLATFORM_URL: z.optional(z.string()),
  VITE_APP_ORGANIZATION_ID: z.string(),
  VITE_APP_API_KEY: z.string(),
  VITE_APP_USER_EMAIL: z.string(),
});
export type SearchTokenServerConfig = z.infer<typeof zValidEnvironment>;

/**
 * Making sure all environment variables are defined
 *
 * @returns true if the .env file is valid. false otherwise.
 */
export default function isEnvValid(
  env: unknown
): env is z.infer<typeof zValidEnvironment> {
  return zValidEnvironment.safeParse(env).success;
}
