import {Source} from '@coveo/push-api-client';
import {Command, flags} from '@oclif/command';
import {green} from 'chalk';
import {fstatSync, PathLike, readdirSync} from 'fs';
import {readFile, readdir} from 'fs-extra';
import dedent from 'ts-dedent';
import {
  IsAuthenticated,
  Preconditions,
} from '../../../lib/decorators/preconditions';
import {AuthenticatedClient} from '../../../lib/platform/authenticatedClient';
import {parseAndGetDocumentBuilderFromJSONDocument} from '../../../lib/push/parseFile';

interface AxiosResponse {
  status: number;
  statusText: string;
}

export default class SourcePushAdd extends Command {
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
      flags.folder.forEach((f) => {
        //const files = readdirSync(f).forEach((f) => {});
      });
    }
  }

  private doPushFolder(source: Source) {
    const {flags, args} = this.parse(SourcePushAdd);
    return Promise.all(
      flags.folder.map((f) => {
        return readdirSync(f).map((f) =>
          this.pushSingleFile(source, f, args.sourceId)
        );
      })
    );
  }

  private doPushFile(source: Source) {
    const {flags, args} = this.parse(SourcePushAdd);
    return Promise.all(
      flags.file.map((f) => this.pushSingleFile(source, f, args.sourceId))
    );
  }

  private pushSingleFile(source: Source, file: PathLike, sourceId: string) {
    try {
      const docBuilders = parseAndGetDocumentBuilderFromJSONDocument(file);
      return docBuilders.map(async (docBuilder) => {
        const res = await source.addOrUpdateDocument(sourceId, docBuilder);
        this.successMessageOnAdd(`${docBuilder.build().uri}: ${file}`, res);
      });
    } catch (e) {
      this.error(e);
    }
  }

  private successMessageOnAdd(toAdd: string, res: AxiosResponse) {
    this.log(
      dedent(`
    Successfully added document: ${green(toAdd)}
    Status code: ${green(res.status, res.statusText)}
    `)
    );
  }
}
