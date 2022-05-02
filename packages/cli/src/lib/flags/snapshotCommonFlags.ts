import {Flags} from '@oclif/core';
import {Snapshot} from '../snapshot/snapshot';

export enum PreviewLevelValue {
  Light = 'light',
  Detailed = 'detailed',
}

export const wait = () => ({
  wait: Flags.integer({
    char: 'w',
    default: Snapshot.defaultWaitOptions.wait,
    helpValue: 'seconds',
    required: false,
    description:
      'The maximum number of seconds to wait before the commands exits with a timeout error. A value of zero means that the command will wait indefinitely.',
  }),
});

export const sync = () => ({
  sync: Flags.boolean({
    char: 'y',
    default: false,
    required: false,
    description:
      'Apply synchronization when there is a 100% match between organization and snapshot resources.',
  }),
});

export const previewLevel = () => ({
  previewLevel: Flags.enum({
    char: 'p',
    description:
      'The verbosity of the preview. The `light` preview is faster to generate but only contains a limited amount of information, as opposed to the `detailed` preview that takes more time to generate, but returns a diff representation of all the changes to apply.',
    options: Object.values(PreviewLevelValue),
    default: PreviewLevelValue.Detailed,
    exclusive: ['skipPreview'],
  }),
});

export const organization = (description: string) => ({
  organization: Flags.string({
    char: 'o',
    helpValue: 'targetorganizationg7dg3gd',
    required: false,
    description: `${description} If not specified, the organization you are connected to will be used.`,
  }),
});
