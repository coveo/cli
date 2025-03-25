import {CLICommand} from '@coveo/cli-commons/command/cliCommand';

export default class Create extends CLICommand {
  public static description = 'Deprecated';

  public async run() {
    this.log(
      `The update command is deprecated. If you are using a binary install, please uninstall the Coveo CLI and reinstall it using npm. If you are already using an npm install, please update the Coveo CLI using npm.`
    );
  }
}
