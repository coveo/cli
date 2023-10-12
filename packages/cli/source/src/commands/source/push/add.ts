import {
  BatchUpdateDocumentsFromFiles,
  BuiltInTransformers,
  PushSource,
} from '@coveo/push-api-client';
import {CLICommand} from '@coveo/cli-commons/command/cliCommand';
import {startSpinner} from '@coveo/cli-commons/utils/ux';
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
import {getFileNames} from '../../../lib/getFileNames';
import {AddDisplay} from '../../../lib/addDisplay';
import {Args} from '@oclif/core';

export default class SourcePushAdd extends CLICommand {
  public static description =
    'Index a JSON document into a Coveo Push source. See https://github.com/coveo/cli/wiki/Pushing-JSON-Files-with-the-Coveo-CLI for more information.';

  public static flags = {
    ...withFiles(),
    ...withMaxConcurrent(),
    ...withCreateMissingFields(),
    ...withNormalizeInvalidFields(),
  };

  public static args = {
    sourceId: Args.string({
      required: true,
      description:
        'The identifier of the source on which to perform the add operation. See source:list to obtain the identifier.',
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
    const {args, flags} = await this.parse(SourcePushAdd);
    const source = this.getSource();

    startSpinner('Processing files');

    const fileNames = getFileNames(flags, SourcePushAdd.id);
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
      .onBatchUpload((data) => this.display.successMessageOnAdd(data))
      .onBatchError((err, data) => this.display.errorMessageOnAdd(err, data))
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
    this.display.printSummary();
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
}
