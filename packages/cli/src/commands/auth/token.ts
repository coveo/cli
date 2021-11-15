import {Command, flags} from '@oclif/command';
import {Config} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';
import {PlatformEnvironment} from '../../lib/platform/environment';
import {Region} from '@coveord/platform-client';
import {withEnvironment, withRegion} from '../../lib/flags/platformCommonFlags';
import {Trackable} from '../../lib/decorators/preconditions/trackable';
import {feedbackOnSuccessfulLogin} from '../../lib/login/loginCommon';

export default class Token extends Command {
  private configuration!: Config;
  public static description =
    'Log in to the Coveo Platform using the OAuth2 flow.';

  public static examples = ['$ coveo auth:token'];

  public static flags = {
    ...withRegion(),
    ...withEnvironment(),
    token: flags.string({
      char: 't',
      description:
        'The API-Key that shall be used to authenticate you to the organization. See <https://github.com/coveo/cli/wiki/Using-the-CLI-using-an-API-Key>.',
      required: true,
      helpValue: 'xxx-api-key',
    }),
  };

  @Trackable()
  public async run() {
    this.configuration = new Config(this.config.configDir, this.error);
    this.saveToken();
    this.saveRegionAndEnvironment();
    await this.fetchAndSaveOrgId();
    await feedbackOnSuccessfulLogin(this.configuration);
  }

  @Trackable()
  public async catch(err?: Error) {
    throw err;
  }

  private saveToken() {
    const flags = this.flags;
    this.configuration.set('accessToken', flags.token);
    this.configuration.set('anonymous', true);
  }

  private saveRegionAndEnvironment() {
    const flags = this.flags;
    const cfg = this.configuration;
    cfg.set('environment', flags.environment as PlatformEnvironment);
    cfg.set('region', flags.region as Region);
  }

  private async fetchAndSaveOrgId() {
    this.configuration.set(
      'organization',
      await this.pickFirstAvailableOrganization()
    );
  }

  private get flags() {
    const {flags} = this.parse(Token);
    return flags;
  }

  private async pickFirstAvailableOrganization() {
    const orgs = await new AuthenticatedClient().getAllOrgsUserHasAccessTo();
    return orgs[0]?.id;
  }
}
