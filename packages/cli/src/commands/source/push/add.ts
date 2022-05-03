import {PushSource, UploadBatchCallbackData} from '@coveo/push-api-client';
import {Command, Flags, CliUx} from '@oclif/core';
import {green} from 'chalk';
import {readdirSync} from 'fs';
import {join} from 'path';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {
  readOrganizationPrivilege,
  writeFieldsPrivilege,
  writeSourceContentPrivilege,
} from '../../../lib/decorators/preconditions/platformPrivilege';
import {Trackable} from '../../../lib/decorators/preconditions/trackable';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {errorMessage, successMessage} from '../../../lib/push/userFeedback';

export default class SourcePushAdd extends Command {
  public static description =
    'Push a JSON document into a Coveo Push source. See https://github.com/coveo/cli/wiki/Pushing-JSON-files-with-Coveo-CLI for more information.';

  public static flags = {
    file: Flags.string({
      multiple: true,
      exclusive: ['folder'],
      char: 'f',
      helpValue: 'myfile.json',
      description: 'One or multiple file to push. Can be repeated.',
    }),
    folder: Flags.string({
      multiple: true,
      exclusive: ['file'],
      char: 'd',
      helpValue: './my_folder_with_multiple_json_files',
      description:
        'One or multiple folder containing json files. Can be repeated',
    }),
    maxConcurrent: Flags.integer({
      exclusive: ['file'],
      char: 'c',
      default: 10,
      description:
        'The maximum number of requests to send concurrently. Increasing this value increases the speed at which documents are pushed to the Coveo platform. However, if you run into memory or throttling issues, consider reducing this value.',
    }),
    createMissingFields: Flags.boolean({
      char: 'm',
      allowNo: true,
      default: true,
      description:
        'Analyse documents to detect and automatically create missing fields in the destination organization. When enabled, an error will be thrown if a field is used to store data of inconsistent type across documents.',
    }),
  };

  public static args = [
    {
      name: 'sourceId',
      required: true,
      description:
        'The identifier of the source on which to perform the add operation. See source:push:list to obtain the identifier.',
    },
  ];

  @Trackable()
  @Preconditions(
    IsAuthenticated(),
    HasNecessaryCoveoPrivileges(
      writeFieldsPrivilege,
      readOrganizationPrivilege,
      writeSourceContentPrivilege
    )
  )
  public async run() {
    const {args, flags} = await this.parse(SourcePushAdd);
    if (!flags.file && !flags.folder) {
      this.error(
        'You must minimally set the `file` or the `folder` flag. Use `source:push:add --help` to get more information.'
      );
    }
    const {accessToken, organization, environment, region} =
      await new AuthenticatedClient().cfg.get();
    const source = new PushSource(accessToken!, organization, {
      environment,
      region,
    });

    CliUx.ux.action.start('Processing...');

    const fileNames = await this.getFileNames();
    const options = {
      maxConcurrent: flags.maxConcurrent,
      createFields: flags.createMissingFields,
    };
    await source.setSourceStatus(args.sourceId, 'REFRESH');

    await source
      .batchUpdateDocumentsFromFiles(args.sourceId, fileNames, options)
      .onBatchUpload((data) => this.successMessageOnAdd(data))
      .onBatchError((data) => this.errorMessageOnAdd(data))
      .batch();

    await source.setSourceStatus(args.sourceId, 'IDLE');

    CliUx.ux.action.stop(green('✔'));
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async getFileNames() {
    const {flags} = await this.parse(SourcePushAdd);
    let fileNames: string[] = [];
    if (flags.file) {
      fileNames = fileNames.concat(flags.file);
    }
    if (flags.folder) {
      const isString = (file: string | null): file is string => Boolean(file);
      fileNames = fileNames.concat(
        flags.folder
          .flatMap((folder) =>
            readdirSync(folder, {withFileTypes: true}).map((dirent) =>
              dirent.isFile() ? join(folder, dirent.name) : null
            )
          )
          .filter(isString)
      );
    }
    return fileNames;
  }

  private successMessageOnAdd({batch, files, res}: UploadBatchCallbackData) {
    // Display the first 5 files (from the list of all files) being processed for end user feedback
    // Don't want to clutter the output too much if the list is very long.

    const numAdded = batch.length;
    let fileNames = files.slice(0, 5).join(', ');
    if (files.length > 5) {
      fileNames += ` and ${files.length - 5} more ...`;
    }

    return successMessage(
      this,
      `Success: ${green(numAdded)} document${
        numAdded > 1 ? 's' : ''
      } accepted by the Push API from ${green(fileNames)}.`,
      res
    );
  }

  private errorMessageOnAdd(err: unknown) {
    return errorMessage(this, 'Error while trying to add document.', err, {
      exit: true,
    });
  }
}
