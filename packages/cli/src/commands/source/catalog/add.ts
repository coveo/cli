import {UploadBatchCallbackData, CatalogSource} from '@coveo/push-api-client';
import {BatchUploadDocumentsFromFilesReturn} from '@coveo/push-api-client/dist/definitions/source/batchUploadDocumentsFromFile';
import {Command, Flags, CliUx} from '@oclif/core';
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
  withFile,
  withCreateMissingFields,
  withFolder,
  withMaxConcurrent,
} from '../../../lib/flags/sourceCommonFlags';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {errorMessage, successMessage} from '../../../lib/push/userFeedback';
import {getFileNames} from '../../../lib/utils/file';

interface AxiosResponse {
  status: number;
  statusText: string;
}

export default class SourceCatalogAdd extends Command {
  public static description =
    'Index a JSON document into a Coveo Catalog source. See https://docs.coveo.com/en/2956/coveo-for-commerce/index-commerce-catalog-content-with-the-stream-api for more information.';

  public static flags = {
    ...withFile(),
    ...withFolder(),
    ...withMaxConcurrent(),
    ...withCreateMissingFields(),
    fullUpload: Flags.boolean({
      char: 'm',
      default: false,
      description: `Initial catalog upload.
        Chose true if you already performed a initial upload and you want to update smaller...
        choose false if you want haven't uploaded your documents yet or if you want to completyle overwrite your catalog`,
    }),
  };

  public static args = [
    {
      name: 'sourceId',
      required: true,
      description:
        'The identifier of the Catalog source on which to perform the add operation. See source:list to obtain the identifier.',
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
    const {args, flags} = await this.parse(SourceCatalogAdd);
    if (!flags.file && !flags.folder) {
      this.error(
        'You must minimally set the `file` or the `folder` flag. Use `source:catalog:add --help` to get more information.'
      );
    }
    const {accessToken, organization, environment, region} =
      await new AuthenticatedClient().cfg.get();
    const source = new CatalogSource(accessToken!, organization, {
      environment,
      region,
    });

    const fileNames = await getFileNames(flags);
    const options = {
      maxConcurrent: flags.maxConcurrent,
      createFields: flags.createMissingFields,
    };
    const batchOperation = flags.fullUpload
      ? source.batchUpdateDocumentsFromFiles
      : source.batchStreamDocumentsFromFiles;

    CliUx.ux.action.start('Processing...');
    await batchOperation(args.sourceId, fileNames, options)
      .onBatchUpload(this.successMessageOnAdd)
      .onBatchError(this.errorMessageOnAdd)
      .batch();

    CliUx.ux.action.stop();
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
      } accepted by the Stream API from ${green(fileNames)}.`,
      res
    );
  }

  private errorMessageOnAdd(e: unknown) {
    return errorMessage(this, 'Error while trying to add document.', e, {
      exit: true,
    });
  }
}
