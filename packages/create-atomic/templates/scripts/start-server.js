const {spawn} = require('child_process');
const {resolve, join} = require('path');
const {config} = require('dotenv');
const {getPackageManager} = require('./utils');
config();

function getEnvVariables() {
  var envVars = Object.assign(
    {
      SERVER_PORT: process.env.ATOMIC_APP_SERVER_PORT,
      API_KEY: process.env.ATOMIC_APP_API_KEY,
      ORGANIZATION_ID: process.env.ATOMIC_APP_ORGANIZATION_ID,
      PLATFORM_URL: process.env.ATOMIC_APP_PLATFORM_URL,
      USER_EMAIL: process.env.ATOMIC_APP_USER_EMAIL,
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
  const handleKill = () => {
    child.kill();
  };
  process.on('SIGINT', handleKill);
  process.on('SIGHUP', handleKill);
  process.on('SIGBREAK', handleKill);
}

function main() {
  startServer();
}

main();
