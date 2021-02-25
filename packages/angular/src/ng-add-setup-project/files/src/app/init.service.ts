import {Injectable, APP_INITIALIZER} from '@angular/core';
import {environment} from 'src/environments/environment';
import {EngineService} from './engine.service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(private engineService: EngineService) {}

  async init() {
    const res = await fetch(environment.tokenEndpoint);
    const {token} = await res.json();
    this.engineService.init(token);
  }
}

export const InitProvider = {
  provide: APP_INITIALIZER,
  useFactory: (initService: InitService) => () => initService.init(),
  deps: [InitService],
  multi: true,
};
