import {Transform} from 'stream';

export class ReactStdoutTransformer extends Transform {
  private stopWritingInTerminal: boolean;
  private internalRemainingStdout: string;
  public constructor(private projectName: string) {
    super({
      transform(this: ReactStdoutTransformer, chunk, _encoding, callback) {
        const textChunk: string = chunk.toString();
        if (this.shouldHoldLogs(textChunk)) {
          this.internalRemainingStdout += textChunk;
          this.stopWritingInTerminal = true;
        } else {
          this.push(textChunk);
        }
        callback();
      },
    });
    this.stopWritingInTerminal = false;
    this.internalRemainingStdout = '';
  }

  public get remainingStdout() {
    return this.internalRemainingStdout;
  }

  private shouldHoldLogs(textChunk: string) {
    return (
      this.stopWritingInTerminal ||
      textChunk.indexOf(`Success! Created ${this.projectName}`) !== -1
    );
  }
}
