import PlatformClient, {ResourceSnapshotsModel} from '@coveord/platform-client';
import {CliUx, Command} from '@oclif/core';
import {CliCommand} from '../../cliCommand';
import {Config} from '../../lib/config/config';
import {ConfigRenderer} from '../../lib/config/configRenderer';
import {Trackable} from '../../lib/decorators/preconditions/trackable';
import {APIError} from '../../lib/errors/APIError';
import {CLIBaseError} from '../../lib/errors/CLIBaseError';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';

export default class Get extends CliCommand {
  public static description = 'Display the current configuration.';

  public static args = [
    {
      name: 'key',
      description: 'The config key for which to show the value',
      required: false,
    },
  ];

  public static examples = [
    '$ coveo config:get',
    '$ coveo config:get organization',
    '$ coveo config:get accessToken',
  ];

  public static enableJsonFlag = true;

  @Trackable()
  public async run() {
    // const {args} = await this.parse(Get);
    // const cfg = new Config(this.config.configDir);
    // const keysToRender = args.key ? [args.key] : undefined;
    // ConfigRenderer.render(cfg, keysToRender);

    class CustomError extends Error {
      constructor(obj: {}) {
        super();
        this.message = JSON.stringify(obj);
      }
    }

    // console.error
    // this.error('dsadasdsad sdas');

    // Throwing a natif error
    // throw new Error('dsadsa');

    // Throwing a custom error
    // throw new CustomError({foo: 'dsasd sa'});

    // Throwing an object
    // throw {foo: 'dsasd sa'};
    const client = await new AuthenticatedClient().getClient();
    const a = await client.resourceSnapshot.createFromOrganization(
      {
        resourcesToExport: {EXTENSION: ['*'], FIELD: ['*'], SOURCE: ['*']},
      },
      {}
    );

    // Throwing a string
    // throw new Error('dsa');

    // Should let Oclif handle this errors
    // this.error('this is a message', {
    //   ref: 'http:dsadsa.com',
    //   suggestions: ['coveo:g:fd -s f', 'coveo:reuna s '],
    // });
    // const aa: Record<string, unknown> = {ds: 'dsa', fggds: {dsds: [1, 2]}};
    return a;
  }

  // @Trackable() // TODO: now trackable is only called
  public async catch(err?: Error & {exitCode?: number}) {
    console.log('child catch');
    return super.catch(err);
  }
}
