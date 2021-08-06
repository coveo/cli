import {Command} from '@oclif/command';
import IPC from 'node-ipc';
export default class Redirect extends Command {
  public static description =
    'Log in to the Coveo Platform using the OAuth2 flow.';

  public static examples = ['$ coveo auth:login'];
  public static hidden = true;
  public static args = [{name: 'firstParam'}];

  public async run() {
    process.argv.forEach((a) => this.log(a));
    this.parse(Redirect).argv.forEach((a) => this.log(a));
    await new Promise<void>((resolve) => {
      IPC.config.silent = true;
      IPC.connectTo('coveo', () => {
        IPC.of['coveo'].on('connect', () => {
          IPC.of['coveo'].emit('code', this.parse(Redirect).argv[0]);
          IPC.disconnect('coveo');
          resolve();
        });
      });
    });
  }
}
