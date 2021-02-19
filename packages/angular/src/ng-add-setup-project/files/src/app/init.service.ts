import {Injectable, APP_INITIALIZER} from '@angular/core';
import {environment} from 'src/environments/environment';
import {EngineService} from './engine.service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(private engine: EngineService) {}

  async init() {
    const data = await (await window.fetch(environment.tokenEndpoint)).json();
    this.engine.init(data.token);
  }
}

export const InitProvider = {
  provide: APP_INITIALIZER,
  useFactory: (initService: InitService) => () => initService.init(),
  deps: [InitService],
  multi: true,
};
