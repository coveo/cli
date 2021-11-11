import {buildEvent} from '../analytics/eventUtils';

export const signals = ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP'] as const;

export const handleTerminationSignals = () => {
  signals.forEach((signal) => process.on(signal, () => trackEvent(signal)));
};

function trackEvent(termination_signal: string) {
  config.runHook('analytics', {
    event: buildEvent('interrupted operation', {termination_signal}),
  });

  // eslint-disable-next-line no-process-exit
  process.exit(0);
}
