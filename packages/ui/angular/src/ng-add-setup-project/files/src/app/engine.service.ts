import {Injectable} from '@angular/core';
import {buildSearchEngine, SearchEngine} from '@coveo/headless';
import type {PlatformEnvironment} from '@coveo/headless';
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
        organizationId: environment.organizationId,
        accessToken: accessToken,
        environment: (environment.platformEnvironment ||
          'prod') as PlatformEnvironment,
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
