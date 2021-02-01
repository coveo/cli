import {Command} from '@oclif/command';
import AuthenticationRequired from '../../lib/decorators/authenticationRequired';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';

export default class List extends Command {
  static description = 'test command for oauth + config that list orgs';

  static args = [{name: 'file'}];

  @AuthenticationRequired()
  async run() {
    const sources = await (
      await new AuthenticatedClient().getClient()
    ).source.list();
    return sources.sourceModels.forEach((source) => this.log(source.name));
  }
}
