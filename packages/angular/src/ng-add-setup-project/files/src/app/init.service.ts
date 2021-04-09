import {Router} from '@angular/router';
import {Injectable, APP_INITIALIZER} from '@angular/core';
import {environment} from '../environments/environment';
import {EngineService} from './engine.service';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  constructor(private engineService: EngineService, private route: Router) {}

  async init() {
    const res = await fetch(environment.tokenEndpoint);
    const data = await res.json();
    const token = data.token;

    if (!token) {
      this.route.navigate(['error'], {state: {errorMessage: data.message}});
      return;
    }
    this.engineService.init(token);
  }
}

export const InitProvider = {
  provide: APP_INITIALIZER,
  useFactory: (initService: InitService) => () => initService.init(),
  deps: [InitService],
  multi: true,
};
