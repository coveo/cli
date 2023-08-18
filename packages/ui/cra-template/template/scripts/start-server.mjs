import {spawn} from 'node:child_process';
import {resolve, join} from 'node:path';
import {config} from 'dotenv';
import {getPackageManager} from './utils.mjs';
config();

function getEnvVariables() {
  var envVars = Object.assign(
    {
      SERVER_PORT: process.env.REACT_APP_SERVER_PORT,
      API_KEY: process.env.REACT_APP_API_KEY,
      ORGANIZATION_ID: process.env.REACT_APP_ORGANIZATION_ID,
      PLATFORM_URL: process.env.REACT_APP_PLATFORM_URL,
      USER_EMAIL: process.env.REACT_APP_USER_EMAIL,
      PLATFORM_ENVIRONMENT: process.env.REACT_APP_PLATFORM_ENVIRONMENT,
    },
    process.env
  );
  return envVars;
}

function startServer() {
  const serverPath = join(process.cwd(), 'server');
  const child = spawn(getPackageManager(), ['run', 'start'], {
    stdio: 'inherit',
    env: getEnvVariables(),
    cwd: resolve(serverPath),
  });
  process.on('SIGINT', () => {
    child.kill();
  });
}

function main() {
  startServer();
}

main();
