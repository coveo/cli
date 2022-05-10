import {SourceVisibility} from '@coveo/push-api-client';
import {Flags} from '@oclif/core';

export const withFiles = () => ({
  files: Flags.string({
    multiple: true,
    char: 'f',
    helpValue: 'myfile.json',
    description:
      'Combinaison of JSON files and folders (containing JSON files) to push. Can be repeated.',
  }),
});

export const withMaxConcurrent = () => ({
  maxConcurrent: Flags.integer({
    exclusive: ['file'],
    char: 'c',
    default: 10,
    description:
      'The maximum number of requests to send concurrently. Increasing this value increases the speed at which documents are indexed to the Coveo platform. However, if you run into memory or throttling issues, consider reducing this value.',
  }),
});

export const withCreateMissingFields = () => ({
  createMissingFields: Flags.boolean({
    char: 'm',
    allowNo: true,
    default: true,
    description:
      'Analyse documents to detect and automatically create missing fields in the destination organization. When enabled, an error will be thrown if a field is used to store data of inconsistent type across documents.',
  }),
});

export const withSourceVisibility = () => ({
  sourceVisibility: Flags.enum({
    options: [
      SourceVisibility.PRIVATE,
      SourceVisibility.SECURED,
      SourceVisibility.SHARED,
    ],
    description:
      'Controls the content security option that should be applied to the items in a source. See https://docs.coveo.com/en/1779/index-content/content-security',
    default: SourceVisibility.SECURED,
    char: 'v',
  }),
});
