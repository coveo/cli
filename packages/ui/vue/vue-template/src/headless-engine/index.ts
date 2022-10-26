import { buildSearchEngine } from "@coveo/headless";
import type { SearchEngine } from "@coveo/headless";
import { getTokenEndpoint, isEnvValid } from "./envUtils";
import type { App } from "vue";
import { HeadlessInjectionKey } from "@/headlessKey";
export default {
  install: (app: App) => {
    if (!isEnvValid(import.meta.env)) {
      throw new Error(`
            You should have a valid <code>.env</code> file at the root of this \
            project. You can use <code>.env.example</code> as starting point and \
            make sure to replace all placeholder variables by the proper information \
            for your organization.
        
            Refer to the project README file for more information.
            `);
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
      platformUrl: import.meta.env.VITE_APP_PLATFORM_URL!,
      organizationId: import.meta.env.VITE_APP_ORGANIZATION_ID!,
      accessToken: token,
      renewAccessToken: async () => {
        const res = await fetch(endpoint);
        const { token } = await res.json();
        return token;
      },
    },
  });
}
