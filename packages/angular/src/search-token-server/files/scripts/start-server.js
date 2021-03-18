const {spawnSync} = require('child_process');
const {resolve, join} = require('path');
const {config} = require('dotenv');
config();

function getEnvVariables() {
  var envVars = Object.assign({}, process.env);
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
