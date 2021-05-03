import {Command, flags} from '@oclif/command';
import {cli} from 'cli-ux';
import {Config} from '../../lib/config/config';
import {
  Preconditions,
  HasAccessToken,
} from '../../lib/decorators/preconditions/';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';

export default class OrgCreate extends Command {
  static description = 'Create a new trial Coveo organization';

  private configuration!: Config;

  static flags = {
    setDefaultOrganization: flags.boolean({
      char: 'D',
      default: false,
      description: 'Set the newly created organization as the default one',
    }),
  };

  static args = [
    {
      name: 'name',
      description: 'The name to assign to the new organization.',
      required: true,
    },
  ];

  @Preconditions(HasAccessToken())
  async run() {
    const {args, flags} = this.parse(OrgCreate);

    this.configuration = new Config(this.config.configDir, this.error);
    const authenticatedClient = new AuthenticatedClient();
    const newCreatedOrg = await authenticatedClient.createOrganization(
      args.name
    );

    if (flags.setDefaultOrganization) {
      this.configuration.set('organization', newCreatedOrg.id);
      cli.log('Organization created and set as default');
    } else {
      cli.log('Organization created');
    }

    cli.styledObject(newCreatedOrg);
  }
}
