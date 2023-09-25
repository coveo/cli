import {ux} from '@oclif/core';
import {BaseConfiguration, Config} from './config';

export class ConfigRenderer {
  public static render(
    config: Config,
    keysToDisplay = Config.userFacingConfigKeys
  ) {
    const configuration = config.get();
    const allowedConfig = Object.keys(configuration)
      .filter((key) => keysToDisplay.includes(key as keyof BaseConfiguration))
      .reduce(
        (obj, key) => ({
          ...obj,
          [key]: configuration[key],
        }),
        {}
      );

    ux.styledJSON(allowedConfig);
  }
}
