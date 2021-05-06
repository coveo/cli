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

  private formatTime(hours: number, minutes: number, seconds: number): string {
    const formatter = (n: number) => `0${n}`.slice(-2);
    const time = [hours, minutes, seconds].map(formatter).join(':');
    return `[${time}] `;
  }

  public getTimestamp() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return this.formatTime(hours, minutes, seconds);
  }
}
