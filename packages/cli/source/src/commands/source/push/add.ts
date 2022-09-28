import {
  BatchUpdateDocumentsFromFiles,
  BuiltInTransformers,
  PushSource,
  UploadBatchCallbackData,
} from '@coveo/push-api-client';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {CliUx, Flags} from '@oclif/core';
import {startSpinner} from '@coveo/cli-commons/utils/ux';
import {green} from 'chalk';
import {
  HasNecessaryCoveoPrivileges,
  IsAuthenticated,
  Preconditions,
} from '@coveo/cli-commons/preconditions/index';
import {
  readOrganizationPrivilege,
  writeFieldsPrivilege,
  writeSourceContentPrivilege,
} from '@coveo/cli-commons/preconditions/platformPrivilege';
import {Trackable} from '@coveo/cli-commons/preconditions/trackable';
import {
  withNormalizeInvalidFields,
  withCreateMissingFields,
  withFiles,
  withMaxConcurrent,
} from '../../../lib/commonFlags';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {formatErrorMessage} from '../../../lib/addCommon';
import {errorMessage, successMessage} from '../../../lib/userFeedback';
import {getFileNames} from '../../../lib/getFileNames';

export default class SourcePushAdd extends CLICommand {
  public static description =
    'Index a JSON document into a Coveo Push source. See https://github.com/coveo/cli/wiki/Pushing-JSON-Files-with-the-Coveo-CLI for more information.';

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
    const source = this.getSource();

    startSpinner('Processing files');

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
  }

  public catch(err?: Error & {exitCode?: number}) {
    formatErrorMessage(err);
    return super.catch(err);
  }

  protected async finally(_?: Error) {
    const {args} = await this.parse(SourcePushAdd);
    const source = this.getSource();
    await source.setSourceStatus(args.sourceId, 'IDLE');
    await super.finally(_);
  }

  public getSource() {
    const {accessToken, organization, environment, region} =
      new AuthenticatedClient().cfg.get();
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
