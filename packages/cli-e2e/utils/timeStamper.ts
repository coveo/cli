import {Transform} from 'stream';

export class TimeStamper extends Transform {
  constructor() {
    super({
      transform(chunk, encoding, callback) {
        this.push(`[${TimeStamper.getTimestamp()}] `, encoding);
        this.push(chunk, encoding);
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
