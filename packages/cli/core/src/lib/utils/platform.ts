import {Config} from '@coveo/cli-commons/config/config';

export function getTargetOrg(config: Config, target?: string) {
  if (target) {
    return target;
  }
  const cfg = config.get();
  return cfg.organization;
}
