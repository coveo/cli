import Command from '@oclif/command';
import {Spinner} from './spinner';

/**
 * This is a base class inherited by every command in the CLI. It shares functionality between commands such as sending UA to Coveo.
 *
 * @abstract
 * @class
 * @extends {Command}
 */
export default abstract class extends Command {
  protected spinner: Spinner = new Spinner();

  async init() {
    // do some generic initialization
    // const {flags} = this.parse(this.constructor);
    // this.flags = flags;

    // TODO: Send UA on command from this base class
    // Something like that maybe
    await this.sendCommandToCoveo(this.id);
  }
  async catch(err?: Error) {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err);
  }

  async sendCommandToCoveo(commandId?: string) {
    // TODO: do stuff
    console.log(commandId);
  }
}
