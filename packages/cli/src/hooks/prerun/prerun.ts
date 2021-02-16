import {Hook} from '@oclif/config';
import {cli} from 'cli-ux';
import {Config} from '../../lib/config/config';

const message = `\n\nWelcome to Coveo CLI!\n
Coveo collects usage data and metrics (telemetry) to help improve Coveo CLI.\n
We collect information related to the use of the CLI and plug-ins, such as which commands and parameters were run, performance and error data.\n
We use these data to improve the Coveo platform by looking at trends in command executions.\n
We also use error data to improve the CLI.\n
You can decide to opt in or opt out at any moment by using the config:set command.\n
Read more at https://github.com/coveo/cli/tree/master/packages/cli/PRIVACY.md\n
Do you wish to enable analytics and telemetry tracking ? (y/n)`;

const hook: Hook<'prerun'> = async function () {
  const cfg = new Config(global.config.configDir);
  const configuration = await cfg.get();
  if (
    configuration.analyticsEnabled === true ||
    configuration.analyticsEnabled === false
  ) {
    return;
  }

  const enable = await cli.confirm(message);
  cfg.set('analyticsEnabled', enable);
};

export default hook;
