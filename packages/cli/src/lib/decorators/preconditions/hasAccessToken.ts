import Command from '@oclif/command';
import {Config} from '../../config/config';

export function HasAccessToken() {
  return async function (target: Command) {
    const cfg = new Config(global.config.configDir);

    const {accessToken} = await cfg.get();

    if (!accessToken) {
      target.warn('Not currently logged in. Run coveo auth:login first.');
      return false;
    }

    return true;
  };
}
