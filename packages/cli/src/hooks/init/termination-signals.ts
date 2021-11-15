import {buildEvent} from '../analytics/eventUtils';

export const signalExits = ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP'] as const;

export const handleTerminationSignals = () => {
  signalExits.forEach((signal) =>
    process.on(signal, (_sig: string, code: number) => {
      trackEvent(signal, code);
    })
  );
};

function trackEvent(termination_signal: string, exitCode: number) {
  config.runHook('analytics', {
    event: buildEvent('interrupted operation', {termination_signal}),
  });

  // eslint-disable-next-line no-process-exit
  process.exit(128 + exitCode);
}
