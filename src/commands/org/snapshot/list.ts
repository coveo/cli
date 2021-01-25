import {flags} from '@oclif/command';
import Command from '../../../lib/core/base';

import Snapshot = require('../../../lib/org/snapshot/Snapshot');

export default class OrgSnapshotList extends Command {
  static description = 'List org snapshots';

  static flags = {
    help: flags.help({char: 'h'}),
  };

  // Type IArg '@oclif/parser'
  static args = [
    {name: 'org', required: true, description: 'Coveo Cloud organization'},
  ];

  async run() {
    const {args} = this.parse(OrgSnapshotList);
    const name = args.org;
    this.warn('This is a warning');
    this.debug('To enable Debugging, set environment variable `DEBUG=*`.');
    this.log(`Listing snapshots from ${name} org`);

    this.spinner.spin();
    // TODO: Maybe use dependency injection
    const snapshot = new Snapshot();
    this.log((await snapshot.list()).join(', '));
    // this.error('This is an error');
  }

  // Uncomment for custom Error handling
  // async catch(err: Error) {
  //   console.error('Unable to run list Snapshot');
  //   console.error(err.message);
  //   ... doing custom stuff.....
  // }
}
