import {Command, flags} from '@oclif/command';
import {OAuth} from '../../lib/oauth/oauth';
import {
  PlatformEnvironment,
  PlatformRegion,
} from '../../lib/platform/environment';

export default class Login extends Command {
  static description = 'Log into Coveo platform using OAuth2 flow';

  static examples = ['$ coveo auth:login'];

  static flags = {
    region: flags.string({
      char: 'r',
      options: [
        'us-east-1',
        'eu-west-1',
        'eu-west-3',
        'ap-southeast-2',
        'us-west-2',
      ],
      default: 'us-east-1',
      description:
        'The platform region inside which to login. See https://docs.coveo.com/en/2976',
    }),
    environment: flags.string({
      char: 'e',
      options: ['dev', 'qa', 'prod', 'hipaa'],
      default: 'prod',
      description: 'The platform environment inside which to login.',
    }),
    foo: flags.boolean({
      char: 'f',
    }),
  };

  async run() {
    const {flags} = this.parse(Login);
    const tok = await new OAuth({
      environment: flags.environment as PlatformEnvironment,
      region: flags.region as PlatformRegion,
    }).getToken();
    console.log('GOT TOKEN', tok);
  }
}
