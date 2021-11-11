import {buildEvent} from '../analytics/eventUtils';

function trackEvent(termination_signal: string) {
  config.runHook('analytics', {
    event: buildEvent('interrupted operation', {termination_signal}),
  });

  // eslint-disable-next-line no-process-exit
  process.exit(0);
}

const handleTerminationSignals = () => {
  ['SIGINT', 'SIGTERM', 'SIGQUIT', 'SIGHUP'].forEach((signal) =>
    process.on(signal, () => trackEvent(signal))
  );
};

export default handleTerminationSignals;
