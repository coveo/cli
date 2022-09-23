import {fancyIt} from '@coveo/cli-commons-dev/testUtils/it';
import {CliUx} from '@oclif/core';
import {stderr} from 'stdout-stderr';
import {CLICommand} from '../command/cliCommand';
import {startSpinner, stopSpinner} from './ux';

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

const consumeFirstStderrStream = () => {
  stderr.start();
  CliUx.ux.action.start('test');
  CliUx.ux.action.stop();
  stderr.stop();
};

describe('ux', () => {
  describe('when spinner is ended with no argument', () => {
    beforeAll(() => {
      // FIXME: Seems like a bug in Oclif/core. It mocks process.stderr.write only after the first stream get's written
      consumeFirstStderrStream();
    });

    fancyIt()('no spinner should be running', () => {
      expect(CliUx.ux.action.running).toBe(false);
    });

    fancyIt()('should start a spinner instance', () => {
      startSpinner('something');
      expect(CliUx.ux.action.running).toBe(true);
      stopSpinner();
      expect(CliUx.ux.action.running).toBe(false);
    });

    fancyIt()('should stop running task without error', (ctx) => {
      startSpinner('starting a process');
      stopSpinner();
      expect(ctx.stderr).toContain('starting a process... ✔');
    });

    fancyIt()('should print new task after ending previous task', (ctx) => {
      startSpinner('starting the car');
      startSpinner('installing stuff');
      stopSpinner();
      expect(ctx.stderr).toContain('starting the car... ✔');
      expect(ctx.stderr).toContain('installing stuff... ✔');
    });
  });

  describe('when spinner is ended with an argument', () => {
    fancyIt()('should stop running task with the error', (ctx) => {
      startSpinner('doing something');
      stopSpinner({success: false, message: 'AARRRGgggh 😱'});
      expect(ctx.stderr).toContain('doing something... ! AARRRGgggh 😱');
    });

    fancyIt()('should stop running task with a success', (ctx) => {
      startSpinner('playing a game');
      stopSpinner({success: true, message: 'YEAHH 😀'});
      expect(ctx.stderr).toContain('playing a game... ✔ YEAHH 😀');
    });
  });

  describe('when no spinner is running', () => {
    fancyIt()('should not print anything', (ctx) => {
      stopSpinner();
      stopSpinner();
      stopSpinner();
      expect(ctx.stderr).toBe('');
    });
  });

  describe('when spinning within a command context', () => {
    describe('when the command does not throw errors', () => {
      it('it should end with a ✔', async () => {
        stderr.start();
        await FakeCommandNoError.run();
        stderr.stop();
        expect(stderr.output).toMatch('spinniboiii... ✔');
      });
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
