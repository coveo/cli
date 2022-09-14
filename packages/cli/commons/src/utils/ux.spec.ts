import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {stderr} from 'stdout-stderr';
import {startSpinner, stopSpinner} from './ux';

describe('ux', () => {
  describe('when spinner is ended with no argument', () => {
    beforeEach(() => {
      stderr.start();
      startSpinner('starting a process');
    });

    fancyIt()('should stop running task without error', async (ctx) => {
      stopSpinner();
      stderr.stop();
      expect(ctx.stderr).toContain('starting a process... ✔');
    });

    fancyIt()(
      'should print new task after ending previous task',
      async (ctx) => {
        startSpinner('installing stuff');
        stopSpinner();
        stderr.stop();
        expect(ctx.stderr).toContain('starting a process... ✔');
        expect(ctx.stderr).toContain('installing stuff... ✔');
      }
    );
  });

  describe('when spinner is ended with an argument', () => {
    beforeEach(() => {
      stderr.start();
      startSpinner('starting a process');
    });

    fancyIt()('should stop running task with the error', async (ctx) => {
      stopSpinner({success: false, message: 'AARRRGgggh 😱'});
      stderr.stop();
      expect(ctx.stderr).toContain('starting a process... ! AARRRGgggh 😱');
    });
  });

  describe('when no spinner is running', () => {
    fancyIt()('should not print anything', async (ctx) => {
      stderr.start();
      stopSpinner();
      stopSpinner();
      stopSpinner();
      stderr.stop();
      expect(ctx.stderr).toBe('');
    });
  });
});
