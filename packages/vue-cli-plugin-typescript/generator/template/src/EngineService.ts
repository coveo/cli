/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

declare module 'vue/types/vue' {
  interface Vue {
    engine: ReturnType<typeof getEngine>;
  }
}

export function getEngine(token: string) {
  return new HeadlessEngine({
    configuration: {
      platformUrl: process.env.VUE_APP_PLATFORM_URL,
      organizationId: process.env.VUE_APP_ORGANIZATION_ID!,
      accessToken: token,
      renewAccessToken: async () => {
        const res = await fetch(process.env.VUE_APP_TOKEN_ENDPOINT!);
        const {token} = await res.json();
        return token;
      },
    },
    reducers: searchAppReducers,
  });
}
