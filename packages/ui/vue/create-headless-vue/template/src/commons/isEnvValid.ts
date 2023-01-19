import z from "zod";
import { isBrowser } from "browser-or-node";

const zValidEnvironment = z.object({
  VITE_COVEO_PLATFORM_URL: z.optional(z.string()),
  VITE_COVEO_ORGANIZATION_ID: z.string(),
  SERVER_COVEO_API_KEY: isBrowser ? z.undefined() : z.string(),
  VITE_COVEO_USER_EMAIL: z.string(),
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
