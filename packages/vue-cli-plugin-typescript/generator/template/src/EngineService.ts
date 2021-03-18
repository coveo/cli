/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {HeadlessEngine, searchAppReducers} from '@coveo/headless';

declare module 'vue/types/vue' {
  interface Vue {
    engine: typeof HeadlessEngine.prototype;
  }
}

/**
 * A service that instantiates the global headless engine to be shared across the application.
 * This class is meant to be used as a global mixin (see https://vuejs.org/v2/guide/mixins.html#Global-Mixin)
 */
export class EngineService {
  private engine: typeof HeadlessEngine.prototype;

  /**
   * Creates an instance of EngineService.
   * @param {string} token The access token to use to authenticate requests against the Coveo Cloud endpoints.
   */
  constructor(token: string) {
    this.engine = new HeadlessEngine({
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

  /**
   * Returns the mixin containing the Coveo headless engine.
   */
  public get mixin() {
    return {
      data: () => ({
        engine: this.engine,
      }),
    };
  }
}
