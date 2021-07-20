import {DocumentBuilder, Source} from '@coveo/push-api-client';
import {Command, flags} from '@oclif/command';
import {blueBright, green} from 'chalk';
import {cli} from 'cli-ux';
import {readdirSync} from 'fs';
import path from 'path';
import dedent from 'ts-dedent';
import {
  buildAnalyticsFailureHook,
  buildAnalyticsSuccessHook,
} from '../../../hooks/analytics/analytics';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {parseAndGetDocumentBuilderFromJSONDocument} from '../../../lib/push/parseFile';
import {
  ErrorFromAPI,
  errorMessage,
  successMessage,
} from '../../../lib/push/userFeedback';

interface AxiosResponse {
  status: number;
  statusText: string;
}

export default class SourcePushAdd extends Command {
  private static maxContentLength = 5 * 1024 * 1024;
  public static description = 'Push a JSON document into a Coveo push source.';

  public static flags = {
    file: flags.string({
      multiple: true,
      exclusive: ['folder'],
      char: 'f',
      helpValue: 'myfile.json',
      description: 'One or multiple file to push. Can be repeated.',
    }),
    folder: flags.string({
      multiple: true,
      exclusive: ['file'],
      char: 'd',
      helpValue: './my_folder_with_multiple_json_files',
      description:
        'One or multiple folder containing json files. Can be repeated',
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

  @Preconditions(IsAuthenticated())
  public async run() {
    const {flags} = this.parse(SourcePushAdd);
    if (!flags.file && !flags.folder) {
      this.error(
        'You must provide either --file= or --folder=. See source:push:add --help for more information.'
      );
    }
    const cfg = await new AuthenticatedClient().cfg.get();
    const source = new Source(cfg.accessToken!, cfg.organization);

    if (flags.file) {
      await this.doPushFile(source);
    }
    if (flags.folder) {
      await this.doPushFolder(source);
    }

    await this.config.runHook(
      'analytics',
      buildAnalyticsSuccessHook(this, flags)
    );
  }

  private async doPushFolder(source: Source) {
    const {flags, args} = this.parse(SourcePushAdd);

    const fileNames = flags.folder.flatMap((folder) => {
      const files = readdirSync(folder);
      return files.map((f) => `${path.join(folder, f)}`);
    });

    const {send, close} = this.splitByChunkAndUpload(
      source,
      args.sourceId,
      fileNames
    );

    cli.action.start('Processing...');

    await Promise.all(
      flags.folder.flatMap((folder) => {
        return Promise.all(
          readdirSync(folder).flatMap(async (file) => {
            const fullPath = path.join(folder, file);
            const docBuilders =
              parseAndGetDocumentBuilderFromJSONDocument(fullPath);
            this.successMessageOnParseFile(fullPath, docBuilders.length);
            await send(docBuilders);
          })
        );
      })
    );

    await close();
    cli.action.stop();
  }

  private async doPushFile(source: Source) {
    const {flags, args} = this.parse(SourcePushAdd);

    const {send, close} = this.splitByChunkAndUpload(
      source,
      args.sourceId,
      flags.file
    );

    cli.action.start('Processing...');

    await Promise.all(
      flags.file.flatMap(async (file) => {
        const docBuilders = parseAndGetDocumentBuilderFromJSONDocument(file);
        this.successMessageOnParseFile(file, docBuilders.length);
        await send(docBuilders);
      })
    );

    await close();
    cli.action.stop();
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(SourcePushAdd);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private splitByChunkAndUpload(
    source: Source,
    sourceId: string,
    fileNames: string[],
    accumulator = this.accumulator
  ) {
    const send = async (documentBuilders: DocumentBuilder[]) => {
      for (const docBuilder of documentBuilders) {
        const sizeOfDoc = Buffer.byteLength(
          JSON.stringify(docBuilder.marshal())
        );

        if (accumulator.size + sizeOfDoc >= SourcePushAdd.maxContentLength) {
          await this.uploadBatch(
            source,
            sourceId,
            accumulator.chunks,
            fileNames
          );
          accumulator.chunks = [docBuilder];
          accumulator.size = sizeOfDoc;
        } else {
          accumulator.size += sizeOfDoc;
          accumulator.chunks.push(docBuilder);
        }
      }
    };
    const close = async () => {
      await this.uploadBatch(source, sourceId, accumulator.chunks, fileNames);
    };
    return {send, close};
  }

  private async uploadBatch(
    source: Source,
    sourceId: string,
    batch: DocumentBuilder[],
    fileNames: string[]
  ) {
    try {
      const res = await source.batchUpdateDocuments(sourceId, {
        addOrUpdate: batch,
        delete: [],
      });
      this.successMessageOnAdd(fileNames, batch.length, res);
    } catch (e) {
      this.errorMessageOnAdd(e);
    }
  }

  private get accumulator(): {size: number; chunks: DocumentBuilder[]} {
    return {
      size: 0,
      chunks: [],
    };
  }

  private successMessageOnAdd(
    files: string[],
    numAdded: number,
    res: AxiosResponse
  ) {
    // Display the first 5 files (from the list of all files) being processed for end user feedback
    // Don't want to clutter the output too much if the list is very long.

    let fileNames = files.slice(0, 5).join(', ');
    if (files.length > 5) {
      fileNames += ` and ${files.length - 5} more ...`;
    }

    return successMessage(
      this,
      `Success: ${green(
        numAdded
      )} documents accepted by the Push API from ${green(fileNames)}.`,
      res
    );
  }

  private errorMessageOnAdd(e: ErrorFromAPI) {
    return errorMessage(this, 'Error while trying to add document.', e);
  }

  private successMessageOnParseFile(file: string, numParsed: number) {
    this.log(
      dedent(
        `Parsed ${blueBright(file)} into ${blueBright(numParsed)} documents.`
      )
    );
  }
}
