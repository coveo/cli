import {resolve} from 'node:path';
import {writeFileSync, existsSync} from 'node:fs';

function createEnvFile(filePath) {
  const {orgId, apiKey, platformUrl, user, platformEnvironment} = process.env;

  const projectEnvContent = `
REACT_APP_PLATFORM_URL=${platformUrl}
REACT_APP_ORGANIZATION_ID=${orgId}
REACT_APP_API_KEY=${apiKey}
REACT_APP_USER_EMAIL=${user}
REACT_APP_PLATFORM_ENVIRONMENT=${platformEnvironment}
GENERATE_SOURCEMAP=false`; // TODO: CDX-737: fix exponential-backoff compilation warnings

  writeFileSync(filePath, projectEnvContent);
}

function main() {
  const filePath = resolve('.env');
  const exists = existsSync(filePath);
  if (!exists) {
    createEnvFile(filePath);
  }
}

main();
