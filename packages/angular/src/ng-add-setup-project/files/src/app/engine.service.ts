import {Injectable} from '@angular/core';
import {HeadlessEngine, searchAppReducers} from '@coveo/headless';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EngineService {
  private engine!: HeadlessEngine<typeof searchAppReducers>;

  public constructor() {}

  public init(accessToken: string) {
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

  public getTokenEndpoint = () => {
    return environment.customTokenEndpoint || environment.defaultTokenEndpoint;
  };

  public get() {
    return this.engine;
  }
}
