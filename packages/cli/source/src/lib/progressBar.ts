import {MultiBar, SingleBar} from 'cli-progress';
import {cyan} from 'chalk';

export class ProgressBar {
  private bar?: SingleBar;
  private multibar: MultiBar;
  private static container = {
    format: `Upload Progress | ${cyan('{bar}')} | {value}/{total} documents`,
    hideCursor: true,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',

    // only the bars will be cleared, not the logged content
    clearOnComplete: false,
    stopOnComplete: true,

    // important! redraw everything to avoid "empty" completed bars
    forceRedraw: true,
  };

  public constructor() {
    this.multibar = this.createBarContainer();
  }

  public increment(count: number) {
    this.bar?.increment(count);
    return this;
  }

  public ensureInitialization(startValue: number, total?: number) {
    if (total && !this.bar) {
      this.bar = this.multibar.create(total, startValue);
      this.bar.increment();
    }
    return this;
  }

  public log(message: string) {
    // linebreak is required to not break the progress bar
    this.multibar.log(`${message}\n`);
  }

  private createBarContainer() {
    return new MultiBar(ProgressBar.container);
  }
}
