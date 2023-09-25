import {CatalogSource, BuiltInTransformers} from '@coveo/push-api-client';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {Args, Flags} from '@oclif/core';
import {startSpinner} from '@coveo/cli-commons/utils/ux';
import {bold} from 'chalk';
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
  withFiles,
  withCreateMissingFields,
  withMaxConcurrent,
  withNormalizeInvalidFields,
} from '../../../lib/commonFlags';
import {AuthenticatedClient} from '@coveo/cli-commons/platform/authenticatedClient';
import {getFileNames} from '../../../lib/getFileNames';
import dedent from 'ts-dedent';
import {formatErrorMessage} from '../../../lib/addCommon';
import {AddDisplay} from '../../../lib/addDisplay';

const fullUploadDescription = `Controls the way your items are added to your catalog source.

Setting this option to ${bold(
  'false'
)} will trigger a document update (Default operation). Useful to perform incremental updates for smaller adjustments to your catalog that do not require pushing the entire catalog. A document update must only be performed after a full catalog upload.
See https://docs.coveo.com/en/l62e0540

Setting this option to ${bold(
  'true'
)} will trigger a full catalog upload. This process acts as a full rebuild of your catalog source. Therefore, previous items that are not included in the new payload will be deleted.
See https://docs.coveo.com/en/lb4a0344
  `;
export default class SourceCatalogAdd extends CLICommand {
  public static description =
    'Index a JSON document into a Coveo Catalog source. See https://docs.coveo.com/en/2956 for more information.';

  public static flags = {
    ...withFiles(),
    ...withMaxConcurrent(),
    ...withCreateMissingFields(),
    ...withNormalizeInvalidFields(),
    fullUpload: Flags.boolean({
      default: false,
      description: fullUploadDescription,
    }),
    skipFullUploadCheck: Flags.boolean({
      default: false,
      description:
        'Do not check whether a full catalog upload was triggered on the target source.',
    }),
  };

  public static args = {
    sourceId: Args.string({
      required: true,
      description:
        'The identifier of the Catalog source on which to perform the add operation. See `source:list` to obtain the identifier.',
    }),
  };

  private display = new AddDisplay();

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

    if (
      !flags.fullUpload &&
      !flags.skipFullUploadCheck &&
      (await this.isSourceEmpty(args.sourceId))
    ) {
      this.error(dedent`No items detected for this source at the moment.
        As a best practice, we recommend doing a full catalog upload by appending --fullUpload to your command.
        If you are still getting this message despite having already performed a full catalog upload, append --forceUpdate to your command to discard this message.
        `);
    }

    startSpinner('Processing files');

    const {accessToken, organization, environment, region} =
      new AuthenticatedClient().cfg.get();
    const source = new CatalogSource(accessToken!, organization, {
      environment,
      region,
    });

    const fileNames = getFileNames(flags, SourceCatalogAdd.id);
    const options = {
      maxConcurrent: flags.maxConcurrent,
      createFields: flags.createMissingFields,
      fieldNameTransformer: flags.normalizeInvalidFields
        ? BuiltInTransformers.toLowerCase
        : BuiltInTransformers.identity,
    };

    const batchOperation = flags.fullUpload
      ? source.batchStreamDocumentsFromFiles.bind(source)
      : source.batchUpdateDocumentsFromFiles.bind(source);

    await batchOperation(args.sourceId, fileNames, options)
      .onBatchUpload((data) => this.display.successMessageOnAdd(data))
      .onBatchError((err, data) => this.display.errorMessageOnAdd(err, data))
      .batch();
  }

  public catch(err?: Error & {exitCode?: number}) {
    formatErrorMessage(err);
    return super.catch(err);
  }

  protected async finally(_?: Error) {
    this.display.printSummary();
    await super.finally(_);
  }

  private async isSourceEmpty(sourceId: string): Promise<boolean> {
    startSpinner('Checking source status');
    const authenticatedClient = new AuthenticatedClient();
    const platformClient = await authenticatedClient.getClient();
    const {information} = await platformClient.source.get(sourceId);

    return information?.numberOfDocuments === 0;
  }
}
