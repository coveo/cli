import {PushSource, UploadBatchCallbackData} from '@coveo/push-api-client';
import {Command, CliUx, Flags} from '@oclif/core';
import {green} from 'chalk';
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
import {
  withCreateMissingFields,
  withFiles,
  withMaxConcurrent,
} from '../../../lib/flags/sourceCommonFlags';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {errorMessage, successMessage} from '../../../lib/push/userFeedback';
import {getFileNames} from '../../../lib/utils/file';

export default class SourcePushAdd extends Command {
  public static description =
    'Index a JSON document into a Coveo Push source. See https://github.com/coveo/cli/wiki/Pushing-JSON-files-with-Coveo-CLI for more information.';

  public static flags = {
    // TODO: CDX-856: remove file flag
    file: Flags.string({
      // For retro compatibility
      multiple: true,
      hidden: true,
    }),
    // TODO: CDX-856: remove folder flag
    folder: Flags.string({
      // For retro compatibility
      multiple: true,
      char: 'd',
      hidden: true,
    }),
    ...withFiles(),
    ...withMaxConcurrent(),
    ...withCreateMissingFields(),
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
    await this.showDeprecatedFlagWarning();
    const {args, flags} = await this.parse(SourcePushAdd);
    const {accessToken, organization, environment, region} =
      await new AuthenticatedClient().cfg.get();
    const source = new PushSource(accessToken!, organization, {
      environment,
      region,
    });

    CliUx.ux.action.start('Processing files');

    const fileNames = await getFileNames(flags);
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

  private async showDeprecatedFlagWarning() {
    // TODO: CDX-856: no longer needed once flags are removed
    const {flags} = await this.parse(SourcePushAdd);
    if (flags.file || flags.folder) {
      CliUx.ux.warn('Use the `files` flag instead');
    }
  }

  private errorMessageOnAdd(err: unknown) {
    return errorMessage(this, 'Error while trying to add document.', err, {
      exit: true,
    });
  }
}
