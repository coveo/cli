import {CliUx} from '@oclif/core';
import {CLICommand} from '../command/cliCommand';
import {formatOrgId, startSpinner, stopSpinner} from './ux';
import {stderr} from 'stdout-stderr';
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
  beforeAll(() => {
    // @oclif/core has an issue preventing the first stream write to be properly mocked.
    // This is a bodge.
    stderr.start();
    CliUx.ux.action.start('test');
    CliUx.ux.action.stop();
    stderr.stop();
  });

  beforeEach(() => {
    stderr.start();
  });

  afterEach(() => {
    stderr.stop();
  });

  describe('startSpinner() & stopSpinner()', () => {
    describe('when spinner is ended with no argument', () => {
      it('no spinner should be running', () => {
        expect(CliUx.ux.action.running).toBe(false);
      });

      it('should start a spinner instance', () => {
        startSpinner('something');
        expect(CliUx.ux.action.running).toBe(true);
        stopSpinner();
        expect(CliUx.ux.action.running).toBe(false);
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

  describe('formatOrgId()', () => {
    it('colors the color magenta', () => {
      expect(formatOrgId('myOrgId')).toMatchSnapshot();
    });
  });
});
