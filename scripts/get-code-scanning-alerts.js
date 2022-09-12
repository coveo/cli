const {getSnykCodeAlerts} = require('./github-client');

const isHighSeverity = (alert) => alert.rule.severity === 'error';
(async () => {
  const alerts = (await getSnykCodeAlerts()).data;
  const hasAtLeastOneHighAlert = alerts.some(isHighSeverity);
  process.exit(hasAtLeastOneHighAlert ? 1 : 0);
})();
