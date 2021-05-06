import {createWriteStream, WriteStream} from 'fs';
import {join} from 'path';
import {LOGS_PATH} from './browser';
import {mkdirSync} from 'fs-extra';

export class FileLogger {
  public stdout: WriteStream;
  public stderr: WriteStream;
  constructor(name: string) {
    const dir = join(LOGS_PATH, name);
    mkdirSync(dir, {recursive: true});
    this.stdout = createWriteStream(join(dir, 'stdout'));
    this.stderr = createWriteStream(join(dir, 'stderr'));
  }
}
