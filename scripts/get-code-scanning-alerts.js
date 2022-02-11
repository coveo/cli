const {getSnykCodeAlerts} = require('./github-client');

(async () => {
  const alerts = (await getSnykCodeAlerts()).data;
  alerts.filter((alert) => alert.rule.severity === 'error');
  process.exit(alerts.length > 0 ? 1 : 0);
})();
