const {writeFileSync} = require('fs-extra');
const argv = require('yargs-parser')(process.argv.slice(2));

function createEnvFile() {
  const {orgId, apiKey, platformUrl, user} = argv;

  const projectEnvContent = `
REACT_APP_PLATFORM_URL=${platformUrl}
REACT_APP_ORGANIZATION_ID=${orgId}
REACT_APP_API_KEY=${apiKey}

USER_EMAIL=${user}`;

  writeFileSync('.env', projectEnvContent);
}

function main() {
  createEnvFile();
}

main();
