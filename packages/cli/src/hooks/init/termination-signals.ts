import {flush} from '../analytics/analytics';
import {buildEvent} from '../analytics/eventUtils';

export const exitSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP'] as const;

export function handleTerminationSignals() {
  exitSignals.forEach((signal) =>
    process.on(signal, async (_sig: string, exitCode: number) => {
      await trackEvent(signal);
      await flush();
      /**
       * Signal Exits: If Node.js receives a fatal signal such as SIGTERM or SIGHUP, then its exit code will be 128 plus the value of the signal code.
       * This is a standard POSIX practice, since exit codes are defined to be 7-bit integers, and signal exits set the high-order bit,
       * and then contain the value of the signal code.
       *
       * For example, signal SIGABRT has value 6, so the expected exit code will be 128 + 6, or 134.
       * For more info, visit https://nodejs.org/api/process.html#exit-codes
       */
      // eslint-disable-next-line no-process-exit
      process.exit(128 + exitCode);
    })
  );
}

async function trackEvent(termination_signal: string) {
  await config.runHook('analytics', {
    event: buildEvent('interrupted operation', {termination_signal}),
  });
}
