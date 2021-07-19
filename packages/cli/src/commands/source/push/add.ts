import {DocumentBuilder, Source} from '@coveo/push-api-client';
import {Command, flags} from '@oclif/command';
import {blueBright, green} from 'chalk';
import {readdirSync} from 'fs';
import path from 'path';
import internal from 'stream';
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
import through2 from 'through2';

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

  private pushOnChunk(stream: internal.Transform) {}

  private async doPushFolder(source: Source) {
    const {flags, args} = this.parse(SourcePushAdd);

    const fileNames = flags.folder.flatMap((folder) => {
      const files = readdirSync(folder);
      return files.map((f) => `${path.join(folder, f)}`);
    });

    const accumulator = {
      size: 0,
      chunks: [],
    };

    const {onReceive, onEnd} = this.splitByChunkAndUpload(
      accumulator,
      source,
      args.sourceId,
      fileNames
    );

    await Promise.all(
      flags.folder.flatMap((folder) => {
        return Promise.all(
          readdirSync(folder).flatMap(async (file) => {
            const fullPath = path.join(folder, file);
            const docBuilders =
              parseAndGetDocumentBuilderFromJSONDocument(fullPath);
            this.successMessageOnParseFile(fullPath, docBuilders.length);
            await onReceive(docBuilders);
          })
        );
      })
    );

    await onEnd();
  }

  private splitByChunkAndUpload(
    accumulator: {size: number; chunks: DocumentBuilder[]},
    source: Source,
    sourceId: string,
    fileNames: string[]
  ) {
    const onReceive = (documentBuilders: DocumentBuilder[]) => {
      return Promise.all(
        documentBuilders.map(async (docBuilderStream) => {
          const sizeOfDoc = Buffer.byteLength(
            JSON.stringify(docBuilderStream.marshal())
          );

          if (accumulator.size + sizeOfDoc >= SourcePushAdd.maxContentLength) {
            console.log('DOING UPLOAD');
            await this.uploadBatch(
              source,
              sourceId,
              accumulator.chunks,
              fileNames
            );
            accumulator.chunks = [docBuilderStream];
            accumulator.size = 0;
          } else {
            accumulator.size += sizeOfDoc;
            accumulator.chunks.push(docBuilderStream);
          }
        })
      );
    };
    const onEnd = async () => {
      await this.uploadBatch(source, sourceId, accumulator.chunks, fileNames);
    };
    return {onReceive, onEnd};
    /*    return through2
      .obj((documentBuilderStream: DocumentBuilder[], _, callback) => {
        Promise.all(
          documentBuilderStream.map(async (docBuilderStream) => {
            const sizeOfDoc = Buffer.byteLength(
              JSON.stringify(docBuilderStream.marshal())
            );

            if (
              accumulator.size + sizeOfDoc >=
              SourcePushAdd.maxContentLength
            ) {
              console.log('DOING UPLOAD');
              await this.uploadBatch(
                source,
                sourceId,
                accumulator.chunks,
                fileNames
              );
              accumulator.chunks = [docBuilderStream];
              accumulator.size = 0;
            } else {
              accumulator.size += sizeOfDoc;
              accumulator.chunks.push(docBuilderStream);
            }
          })
        ).then(() => {
          callback();
        });
      })
      .on('close', () => {});*/
  }

  private async uploadBatch(
    source: Source,
    sourceId: string,
    batch: DocumentBuilder[],
    fileNames: string[]
  ) {
    const res = await source.batchUpdateDocuments(sourceId, {
      addOrUpdate: batch,
      delete: [],
    });
    this.successMessageOnAdd(fileNames, batch.length, res);
  }

  private async doPushFile(source: Source) {
    const {flags, args} = this.parse(SourcePushAdd);

    const docBuilders = flags.file.flatMap((file) => {
      const docBuilders = parseAndGetDocumentBuilderFromJSONDocument(file);
      this.successMessageOnParseFile(file, docBuilders.length);
      return docBuilders;
    });

    const chunks = this.splitDocBuilderPer10MBChunk(docBuilders);
    chunks.forEach(async (chunk) => {
      const res = await source.batchUpdateDocuments(args.sourceId, {
        addOrUpdate: chunk,
        delete: [],
      });
      this.successMessageOnAdd(flags.file, chunk.length, res);
    });
  }

  private successMessageOnAdd(
    files: string[],
    numAdded: number,
    res: AxiosResponse
  ) {
    let fileNames = files.slice(0, 5).join(', ');
    if (files.length > 5) {
      fileNames += ` and ${files.length - 5} more ...`;
    }

    this.log(
      dedent(`
    Success: ${green(numAdded)} documents accepted by the Push API from ${green(
        fileNames
      )}
    Status code: ${green(res.status, res.statusText)}
    `)
    );
  }

  private successMessageOnParseFile(file: string, numParsed: number) {
    this.log(
      dedent(
        `Parsed ${blueBright(file)} into ${blueBright(numParsed)} documents.`
      )
    );
  }

  public async catch(err?: Error) {
    const {flags} = this.parse(SourcePushAdd);
    await this.config.runHook(
      'analytics',
      buildAnalyticsFailureHook(this, flags, err)
    );
    throw err;
  }

  private splitDocBuilderPer10MBChunk(docBuilders: DocumentBuilder[]) {
    const chunks: DocumentBuilder[][] = [];
    let acc = 0;
    let cur = 0;
    docBuilders.forEach((docBuilder, i) => {
      const currentSize = Buffer.byteLength(
        JSON.stringify(docBuilder.marshal())
      );
      if (i === docBuilders.length - 1) {
        chunks.push(docBuilders.slice(cur, docBuilders.length));
      }
      if (acc + currentSize > SourcePushAdd.maxContentLength) {
        chunks.push(docBuilders.slice(cur, i));
        cur = i;
        acc = 0;
      } else {
        acc += currentSize;
      }
    });

    return chunks;
  }
}
