const {spawnSync} = require('child_process');
const {resolve, join} = require('path');
const {config} = require('dotenv');
config();

function getEnvVariables() {
  const searchTokenServerPort = 4000;
  var envVars = Object.assign(
    {
      PORT: searchTokenServerPort,
      API_KEY: process.env.REACT_APP_API_KEY,
      ORGANIZATION_ID: process.env.REACT_APP_ORGANIZATION_ID,
      PLATFORM_URL: process.env.REACT_APP_PLATFORM_URL,
      USER_EMAIL: process.env.USER_EMAIL,
    },
    process.env
  );
  return envVars;
}

function startServer() {
  const serverPath = join(process.cwd(), 'server');
  const child = spawnSync('npm', ['run', 'start'], {
    stdio: 'inherit',
    env: getEnvVariables(),
    cwd: resolve(serverPath),
  });
  if (child.status !== 0) {
    process.exit(child.status);
  }
}

function main() {
  startServer();
}

main();
