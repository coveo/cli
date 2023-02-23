import {Flags} from '@oclif/core';
import {Snapshot} from '../snapshot/snapshot';

export enum PreviewLevelValue {
  None = 'none',
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
export const previewLevel = () => ({
  previewLevel: Flags.string({
    char: 'p',
    description:
      'The verbosity of the preview. The `light` preview is faster to generate but only contains a limited amount of information, as opposed to the `detailed` preview that takes more time to generate, but returns a diff representation of all the changes to apply.',
    options: Object.values(PreviewLevelValue),
    default: PreviewLevelValue.Detailed,
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

export const snapshotId = () => ({
  snapshotId: Flags.string({
    char: 's',
    exclusive: ['resourceTypes'],
    description:
      'The unique identifier of the snapshot to pull. If not specified, a new snapshot will be created. You can list available snapshot in your organization with org:resources:list',
  }),
});
