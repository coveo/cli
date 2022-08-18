import {
  BatchUpdateDocumentsFromFiles,
  BuiltInTransformers,
  PushSource,
  UploadBatchCallbackData,
} from '@coveo/push-api-client';
import {Command, CliUx, Flags} from '@oclif/core';
import {green, red} from 'chalk';
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
  withNormalizeInvalidFields,
  withCreateMissingFields,
  withFiles,
  withMaxConcurrent,
} from '../../../lib/flags/sourceCommonFlags';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {formatErrorMessage} from '../../../lib/push/addCommon';
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
    ...withNormalizeInvalidFields(),
  };

  public static args = [
    {
      name: 'sourceId',
      required: true,
      description:
        'The identifier of the source on which to perform the add operation. See source:list to obtain the identifier.',
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
    const source = await this.getSource();

    CliUx.ux.action.start('Processing files');

    const fileNames = await getFileNames(flags);
    const options: BatchUpdateDocumentsFromFiles = {
      maxConcurrent: flags.maxConcurrent,
      createFields: flags.createMissingFields,
      fieldNameTransformer: flags.normalizeInvalidFields
        ? BuiltInTransformers.toLowerCase
        : BuiltInTransformers.identity,
    };

    await source.setSourceStatus(args.sourceId, 'REFRESH');
    await source
      .batchUpdateDocumentsFromFiles(args.sourceId, fileNames, options)
      .onBatchUpload((data) => this.successMessageOnAdd(data))
      .onBatchError((data) => this.errorMessageOnAdd(data))
      .batch();

    CliUx.ux.action.stop(green('✔'));
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    formatErrorMessage(err);
    CliUx.ux.action.stop(red.bold('!'));
    throw err;
  }

  protected async finally(_?: Error) {
    const {args} = await this.parse(SourcePushAdd);
    const source = await this.getSource();
    await source.setSourceStatus(args.sourceId, 'IDLE');
    await super.finally(_);
  }

  public async getSource() {
    const {accessToken, organization, environment, region} =
      await new AuthenticatedClient().cfg.get();
    return new PushSource(accessToken!, organization, {
      environment,
      region,
    });
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
