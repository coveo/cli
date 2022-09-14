import {stderr} from 'stdout-stderr';
import {startSpinner, stopSpinner} from './ux';

describe('ux', () => {
  describe('when spinner is ended with no argument', () => {
    it('should stop running task without error', () => {
      stderr.start();
      startSpinner('starting a process');
      stopSpinner();
      stderr.stop();
      expect(stderr.output).toContain('starting a process... ✔');
    });

    it('should print new task after ending previous task', () => {
      stderr.start();
      startSpinner('starting a process');
      startSpinner('installing stuff');
      stopSpinner();
      stderr.stop();
      expect(stderr.output).toContain('starting a process... ✔');
      expect(stderr.output).toContain('installing stuff... ✔');
    });
  });

  describe('when spinner is ended with an argument', () => {
    it('should stop running task with the error', () => {
      stderr.start();
      startSpinner('starting a process');
      stopSpinner({success: false, message: 'AARRRGgggh 😱'});
      stderr.stop();
      expect(stderr.output).toContain('starting a process... ! AARRRGgggh 😱');
    });

    it('should stop running task with a success', () => {
      stderr.start();
      startSpinner('starting a process');
      stopSpinner({success: true, message: 'YEAHH 😀'});
      stderr.stop();
      expect(stderr.output).toContain('starting a process... ✔ YEAHH 😀');
    });
  });

  describe('when no spinner is running', () => {
    it('should not print anything', () => {
      stderr.start();
      stopSpinner();
      stopSpinner();
      stopSpinner();
      stderr.stop();
      expect(stderr.output).toBe('');
    });
  });
});
