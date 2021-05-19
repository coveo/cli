import {Injectable} from '@angular/core';
import {HeadlessEngine, searchAppReducers} from '@coveo/headless';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EngineService {
  private engine!: HeadlessEngine<typeof searchAppReducers>;

  constructor() {}

  init(accessToken: string) {
    this.engine = new HeadlessEngine({
      configuration: {
        platformUrl: environment.platformUrl,
        organizationId: environment.organizationId,
        accessToken: accessToken,
        renewAccessToken: async () => {
          const res = await fetch(this.getTokenEndpoint());
          const {token} = await res.json();
          return token;
        },
      },
      reducers: searchAppReducers,
    });
  }

  getTokenEndpoint = () => {
    return environment.customtokenEndpoint || environment.defaultTokenEndpoint;
  };

  get() {
    return this.engine;
  }
}
