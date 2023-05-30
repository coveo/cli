import {Injectable} from '@angular/core';
import {
  buildSearchEngine,
  SearchEngine,
  getOrganizationEndpoints,
  PlatformEnvironment,
} from '@coveo/headless';
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EngineService {
  private engine!: SearchEngine;

  public constructor() {}

  public init(accessToken: string) {
    this.engine = buildSearchEngine({
      configuration: {
        organizationEndpoints: getOrganizationEndpoints(
          environment.organizationId,
          (environment.platformEnvironment || 'prod') as PlatformEnvironment
        ),
        organizationId: environment.organizationId,
        accessToken: accessToken,
        renewAccessToken: async () => {
          const res = await fetch(this.getTokenEndpoint());
          const {token} = await res.json();
          return token;
        },
      },
    });
  }

  public getTokenEndpoint = () => {
    return environment.customTokenEndpoint || environment.defaultTokenEndpoint;
  };

  public get() {
    return this.engine;
  }
}
