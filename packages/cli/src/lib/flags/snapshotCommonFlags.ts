import {flags} from '@oclif/command';
import {Snapshot} from '../snapshot/snapshot';

export const wait = () => ({
  wait: flags.integer({
    char: 'w',
    default: Snapshot.defaultWaitOptions.wait,
    helpValue: 'seconds',
    required: false,
    description:
      'The maximum number of seconds to wait before the commands exits with a timeout error. A value of zero means that the command will wait indefinitely.',
  }),
});

export const sync = () => ({
  sync: flags.boolean({
    char: 'y',
    default: false,
    required: false,
    description:
      'Apply synchronization when there is a 100% match between organization and snapshot resources.',
  }),
});

export const previewLevel = () => ({
  previewLevel: flags.enum({
    char: 'p',
    description:
      'Whether to only display a light or detailed preview of the overall changes',
    options: ['light', 'detailed'],
    default: 'detailed',
    exclusive: ['skipPreview'],
  }),
});
