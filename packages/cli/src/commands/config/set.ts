import {Command, flags} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {
  PlatformEnvironment,
  PlatformRegion,
} from '../../lib/platform/environment';

export default class Set extends Command {
  static description = 'Modify the current configuration.';

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
      description:
        'The platform region inside which to perform operation. See https://docs.coveo.com/en/2976',
    }),
    environment: flags.string({
      char: 'e',
      options: ['dev', 'qa', 'prod', 'hipaa'],
      description:
        'The platform environment inside which to perform operation.',
    }),
    organization: flags.string({
      char: 'o',
      description: 'The organization inside which to perform operation.',
      helpValue: 'myOrgID',
    }),
  };

  async run() {
    const {flags} = this.parse(Set);
    const cfg = new Config(this.config.configDir, this.error);
    if (flags.environment) {
      cfg.set('environment', flags.environment as PlatformEnvironment);
    }
    if (flags.organization) {
      cfg.set('organization', flags.organization);
    }
    if (flags.region) {
      cfg.set('region', flags.region as PlatformRegion);
    }
  }
}
