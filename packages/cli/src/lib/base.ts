import {Command} from '@oclif/core';

/**
 * This is a base class inherited by every command in the CLI
 *
 * @abstract
 * @class
 * @extends {Command}
 */
export default abstract class extends Command {
  public async init() {
    // do some generic initialization
    // const {flags} = this.parse(this.constructor);
    // this.flags = flags;

    // Send command instruction to Coveo
    await this.sendCommandToCoveo(this.id);
  }
  public async catch(err?: Record<string, unknown>) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err!);
  }

  private async sendCommandToCoveo(commandId?: string) {
    // TODO: do stuff
    const noop = (x: unknown) => x;
    noop(commandId);
  }
}
