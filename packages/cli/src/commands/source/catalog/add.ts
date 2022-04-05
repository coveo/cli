import {UploadBatchCallbackData, CatalogSource} from '@coveo/push-api-client';
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
import {bold} from 'chalk';
import dedent from 'ts-dedent';

export default class SourceCatalogAdd extends Command {
  public static description =
    'Index a JSON document into a Coveo Catalog source. See https://docs.coveo.com/en/2956/coveo-for-commerce/index-commerce-catalog-content-with-the-stream-api for more information.';

  public static flags = {
    ...withFile(),
    ...withFolder(),
    ...withMaxConcurrent(),
    ...withCreateMissingFields(),
    fullUpload: Flags.boolean({
      default: false,
      description: `Controls the way your items are added to your catalog source.

      Setting this option to ${bold(
        'false'
      )} will trigger a document update (Default operation). Useful for incremental updates for smaller adjustments to your catalog without the need of pushing the entire catalog. A document update must only be performed after a full catalog upload.
      See https://docs.coveo.com/en/l62e0540

      Setting this option to ${bold(
        'true'
      )} will trigger a full catalog upload will start. This process acts as a full rebuild of your catalog source, therefore if the payload doesn't contain all the items, previous items will be deleted.
      See https://docs.coveo.com/en/lb4a0344
        `,
    }),
    skipFullLoadCheck: Flags.boolean({
      default: false,
      description: `Do not check if a catalog full load was triggered on the target source.`,
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

    if (
      !flags.fullUpload &&
      !flags.skipFullLoadCheck &&
      (await this.sourceIsEmpty(args.sourceId))
    ) {
      this.error(dedent`No items detected for this source at the moment.
        As a best practice, please consider doing a full catalog upload by adding --fullUpload to your command.
        If you are still getting this message despite having already performed a full catalog upload,
        add --forceUpdate to your command to discard this message.
        `);
    }

    CliUx.ux.action.start('Processing...');

    const fileNames = await getFileNames(flags);
    const options = {
      maxConcurrent: flags.maxConcurrent,
      createFields: flags.createMissingFields,
    };

    const batchOperation = flags.fullUpload
      ? source.batchStreamDocumentsFromFiles.bind(source)
      : source.batchUpdateDocumentsFromFiles.bind(source);

    await batchOperation(args.sourceId, fileNames, options)
      .onBatchUpload((data) => this.successMessageOnAdd(data))
      .onBatchError((data) => this.errorMessageOnAdd(data))
      .batch();

    CliUx.ux.action.stop();
  }

  @Trackable()
  public async catch(err?: Error & {exitCode?: number}) {
    throw err;
  }

  private async sourceIsEmpty(sourceId: string): Promise<boolean> {
    CliUx.ux.action.start('Checking source status...');
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();
    const {information} = await platformClient.source.get(sourceId);

    return information?.numberOfDocuments === 0;
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
      } accepted by the API from ${green(fileNames)}.`,
      res
    );
  }

  private errorMessageOnAdd(e: unknown) {
    return errorMessage(this, 'Error while trying to add document.', e, {
      exit: true,
    });
  }
}
