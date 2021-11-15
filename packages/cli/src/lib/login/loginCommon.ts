import {cli} from 'cli-ux';
import dedent from 'ts-dedent';
import {Config} from '../config/config';
import colors from '../utils/color-utils';

export async function feedbackOnSuccessfulLogin(config: Config) {
  cli.log(dedent`
    Successfully logged in!
    Close your browser to continue.

     ${colors.bold('Login information')}
    `);
  const {organization, region, environment} = await config.get();
  cli.table(
    Object.entries({organization, region, environment}),
    {
      organization: {get: (raw) => raw[0]},
      value: {get: (raw) => colors.blue(raw[1])},
    },
    {'no-header': true}
  );

  cli.log(dedent`

    Run ${colors.cmd(
      'auth:login --help'
    )} to see the available options to log in to a different organization, region, or environment.
    `);
}
