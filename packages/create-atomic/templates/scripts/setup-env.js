const {resolve} = require('path');
const {writeFileSync, existsSync} = require('fs');

function createEnvFile(filePath) {
  const {orgId, apiKey, platformUrl, user} = process.env;

  const projectEnvContent = `
ATOMIC_APP_PLATFORM_URL=${platformUrl}
ATOMIC_APP_ORGANIZATION_ID=${orgId}
ATOMIC_APP_API_KEY=${apiKey}
ATOMIC_APP_USER_EMAIL=${user}`;

  writeFileSync(filePath, projectEnvContent);
}

function main() {
  const filePath = resolve('.env');
  const exists = existsSync(filePath);
  if (!exists) {
    createEnvFile(filePath);
  } else {
    console.error(`file ${filePath} already exists`);
  }
}

main();
