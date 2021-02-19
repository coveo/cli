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
        renewAccessToken: () =>
          window
            .fetch(environment.tokenEndpoint)
            .then((data) => data.json())
            .then((data) => data.token),
      },
      reducers: searchAppReducers,
    });
  }

  get() {
    return this.engine;
  }
}
