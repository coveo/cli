import {Injectable} from '@angular/core';
import {HeadlessEngine, searchAppReducers} from '@coveo/headless';
import {environment} from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EngineService {
  private engine: any;

  constructor() {}

  init(accessToken: string) {
    this.engine = new HeadlessEngine({
      configuration: {
        platformUrl: environment.platformUrl,
        organizationId: environment.organizationId,
        accessToken: accessToken,
        renewAccessToken: async () => {
          const res = await fetch(environment.tokenEndpoint);
          const {token} = await res.json();
          return token;
        },
      },
      reducers: searchAppReducers,
    });
  }

  get() {
    return this.engine;
  }
}
