import { buildSearchEngine } from "@coveo/headless";
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
      platformUrl: import.meta.env.VITE_APP_PLATFORM_URL,
      organizationId: import.meta.env.VITE_APP_ORGANIZATION_ID,
      accessToken: token,
      renewAccessToken: async () => {
        const res = await fetch(endpoint);
        const { token } = await res.json();
        return token;
      },
    },
  });
}
