import { buildSearchEngine, getOrganizationEndpoints } from "@coveo/headless";
import type { SearchEngine } from "@coveo/headless";
import getTokenEndpoint from "./getTokenEndpoint";
import isEnvValid from "commons/isEnvValid";
import type { App } from "vue";
import { HeadlessInjectionKey } from "@/headlessKey";
import router from "@/router";
export default {
  install: (app: App) => {
    if (!isEnvValid(import.meta.env)) {
      router.push("/error");
    } else {
      app.provide(HeadlessInjectionKey, getEngine());
    }
  },
};

async function getEngine(): Promise<SearchEngine> {
  const endpoint = await getTokenEndpoint();
  const res = await fetch(endpoint);
  const { token } = await res.json();
  return buildSearchEngine({
    configuration: {
      organizationEndpoints: getOrganizationEndpoints(
        import.meta.env.VITE_COVEO_ORGANIZATION_ID,
        import.meta.env.VITE_COVEO_PLATFORM_ENVIRONMENT as
          | "prod"
          | "hipaa"
          | "stg"
          | "dev"
      ),
      organizationId: import.meta.env.VITE_COVEO_ORGANIZATION_ID,
      accessToken: token,
      renewAccessToken: async () => {
        const res = await fetch(endpoint);
        const { token } = await res.json();
        return token;
      },
    },
  });
}
