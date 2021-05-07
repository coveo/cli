import {Transform} from 'stream';

export class TimeStamper extends Transform {
  constructor() {
    super({
      transform(chunk, _encoding, callback) {
        this.push(`[${TimeStamper.getTimestamp()}] `);
        this.push(chunk);
        callback();
      },
    });
  }

  private static getTimestamp() {
    return new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
}
