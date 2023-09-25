import {ux} from '@oclif/core';
import {CLICommand} from '../command/cliCommand';
import {stderr} from 'stdout-stderr';
import {startSpinner, stopSpinner, shouldUseColor, formatOrgId} from './ux';

class FakeCommandNoError extends CLICommand {
  public async run() {
    startSpinner('spinniboiii');
  }
}

class FakeCommandWithNonStandardError extends CLICommand {
  public async run() {
    startSpinner('spinniboiii');
    throw {random: 'object'};
  }
}

class FakeCommandWithError extends CLICommand {
  public async run() {
    startSpinner('spinniboiii');
    throw new Error('no more spinning');
  }
}

describe('ux', () => {
  const originalPlatform = process.platform;
  const originalEnv = process.env;

  beforeAll(() => {
    // @oclif/core has an issue preventing the first stream write to be properly mocked.
    // This is a bodge.
    stderr.start();
    ux.action.start('test');
    ux.action.stop();
    stderr.stop();
  });
  beforeEach(() => {
    stderr.start();
  });

  afterEach(() => {
    stderr.stop();
    Object.defineProperty(process, 'platform', {value: originalPlatform});
    process.env = originalEnv;
  });

  describe('startSpinner() & stopSpinner()', () => {
    describe('when spinner is ended with no argument', () => {
      it('no spinner should be running', () => {
        expect(ux.action.running).toBe(false);
      });

      it('should start a spinner instance', () => {
        startSpinner('something');
        expect(ux.action.running).toBe(true);
        stopSpinner();
        expect(ux.action.running).toBe(false);
      });

      it('should stop running task without error', () => {
        startSpinner('starting a process');
        stopSpinner();
        expect(stderr.output).toContain('starting a process... ✔');
      });

      it('should print new task after ending previous task', () => {
        startSpinner('starting the car');
        startSpinner('installing stuff');
        stopSpinner();
        expect(stderr.output).toContain('starting the car... ✔');
        expect(stderr.output).toContain('installing stuff... ✔');
      });
    });

    describe('when spinner is ended with an argument', () => {
      it('should stop running task with the error', () => {
        startSpinner('doing something');
        stopSpinner({success: false});
        expect(stderr.output).toContain('doing something... !');
      });

      it('should stop running task with a success', () => {
        startSpinner('playing a game');
        stopSpinner({success: true});
        expect(stderr.output).toContain('playing a game... ✔');
      });

      describe('when no spinner is running', () => {
        it('should not print anything', () => {
          stopSpinner();
          stopSpinner();
          stopSpinner();
          expect(stderr.output).toBe('');
        });
      });

      describe('when spinning within a command context', () => {
        describe('when the command does not throw errors', () => {
          it('it should end with a ✔', async () => {
            await FakeCommandNoError.run();
            expect(stderr.output).toMatch('spinniboiii... ✔');
          });
        });

        describe('when the command throws any kind of error', () => {
          it.each([
            {command: FakeCommandWithError},
            {command: FakeCommandWithNonStandardError},
          ])('it should end with a !', async ({command}) => {
            try {
              await command.run();
            } catch (error) {
              expect(stderr.output).toMatch('spinniboiii... !');
            }
          });

          describe('when the command throws any kind of error', () => {
            it.each([
              {command: FakeCommandWithError},
              {command: FakeCommandWithNonStandardError},
            ])('it should end with a !', async ({command}) => {
              try {
                stderr.start();
                await command.run();
                stderr.stop();
              } catch (error) {
                expect(stderr.output).toMatch('spinniboiii... !');
              }
            });
          });
        });
      });
    });
  });

  describe('shouldUseColors()', () => {
    describe('when using Windows without WT', () => {
      beforeEach(() => {
        Object.defineProperty(process, 'platform', {value: 'win32'});
        process.env = {};
      });

      it('should return false', () => {
        expect(shouldUseColor()).toBe(false);
      });
    });

    describe('when using Windows with WT', () => {
      beforeEach(() => {
        Object.defineProperty(process, 'platform', {value: 'win32'});
        process.env = {WT_PROFILE_ID: 'potato'};
      });

      it('should return true', () => {
        expect(shouldUseColor()).toBe(true);
      });
    });

    describe('when using anything but Windows', () => {
      beforeEach(() => {
        Object.defineProperty(process, 'platform', {
          value: 'unix',
        });
      });
      it('should return true', () => {
        expect(shouldUseColor()).toBe(true);
      });
    });
  });

  describe('formatOrgId()', () => {
    describe('when shouldUseColor returns true', () => {
      beforeEach(() => {
        Object.defineProperty(process, 'platform', {
          value: 'unix',
        });
      });
      it('colors the color magenta', () => {
        expect(formatOrgId('myOrgId')).toMatchSnapshot();
      });
    });

    describe('when shouldUseColor returns false', () => {
      beforeEach(() => {
        Object.defineProperty(process, 'platform', {value: 'win32'});
        process.env = {};
      });

      it('returns the text without any modif', () => {
        expect(formatOrgId('myOrgId')).toBe('myOrgId');
      });
    });
  });
});
