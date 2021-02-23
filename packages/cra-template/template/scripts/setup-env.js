const {resolve} = require('path');
const {writeFileSync, pathExistsSync} = require('fs-extra');
const argv = require('yargs-parser')(process.argv.slice(2));

function createEnvFile(filePath) {
  const {orgId, apiKey, platformUrl, user} = argv;

  const projectEnvContent = `
REACT_APP_PLATFORM_URL=${platformUrl}
REACT_APP_ORGANIZATION_ID=${orgId}
REACT_APP_API_KEY=${apiKey}

USER_EMAIL=${user}`;

  writeFileSync(filePath, projectEnvContent);
}

function main() {
  const filePath = resolve(__dirname, '.env');
  const exists = pathExistsSync(filePath);
  if (!exists) {
    createEnvFile(filePath);
  } else {
    console.log(`file ${filePath} already exist`);
  }
}

main();
