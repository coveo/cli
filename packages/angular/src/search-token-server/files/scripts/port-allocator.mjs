import {resolve} from 'path';
import {
  readFileSync,
  writeFileSync,
  truncateSync,
  existsSync,
  appendFileSync,
} from 'fs';
import {EOL} from 'os';
import getPort, {makeRange} from 'get-port';
import {config} from 'dotenv';
const pathToServerEnv = resolve('server', '.env');
const environment = config({path: pathToServerEnv}).parsed;

const preferedWebAppPort = 4200;
const portRangeFallback = [4000, 4999];

const ensureEnvironmentFile = () => {
  if (!existsSync(pathToServerEnv)) {
    throw new Error(
      '.env file not found in the project root. Refer to the README to for more information for more information.'
    );
  }
};

const updateTokenServerEnvironment = (serverPort) => {
  const env = {
    ...environment,
    SERVER_PORT: serverPort,
  };

  truncateSync(pathToServerEnv);
  for (const [key, value] of Object.entries(env)) {
    appendFileSync(pathToServerEnv, `${key}=${value}${EOL}`);
  }
};

const addTokenServerPortToWebApp = async (serverPort) => {
  const webAppEnvironment = resolve('src', 'environments', 'environment.ts');
  const portNumberMatcher =
    /defaultTokenEndpoint: 'http:\/\/localhost:\d+\/token'/;
  const appEnvironmentFile = readFileSync(webAppEnvironment, 'utf-8');
  const subst = `defaultTokenEndpoint: 'http://localhost:${serverPort}/token'`;
  const updatedEnvironment = appEnvironmentFile.replace(
    portNumberMatcher,
    subst
  );

  writeFileSync(webAppEnvironment, updatedEnvironment);
};

const allocatePorts = async () => {
  const appPort = await getNextAvailablePorts(preferedWebAppPort, {
    host: '127.0.0.1',
  });
  const serverPort = await getNextAvailablePorts(environment.SERVER_PORT);

  return [appPort, serverPort];
};

const getNextAvailablePorts = async (preferedPort, getPortOptions) => {
  if (typeof preferedPort !== 'number') {
    preferedPort = isNaN(parseInt(preferedPort))
      ? null
      : parseInt(preferedPort);
  }

  if (await isPortAvailable(preferedPort, getPortOptions)) {
    return preferedPort;
  }
  return await getPort({
    port: makeRange(...portRangeFallback),
    ...getPortOptions,
  });
};

const isPortAvailable = async (port, options) => {
  const availablePort = await getPort({port, ...options});
  return availablePort === port;
};

function updateAppPort(port) {
  const angularJsonPath = resolve('angular.json');
  const packageJsonPath = resolve('package.json');

  const angularJSON = JSON.parse(readFileSync(angularJsonPath, 'utf-8'));
  const packageJSON = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  const projectName = packageJSON.name;

  const serve = angularJSON.projects[projectName].architect.serve;
  if (!serve.options) {
    serve.options = {};
  }
  serve.options.port = parseInt(port);

  writeFileSync(angularJsonPath, JSON.stringify(angularJSON, undefined, 2));
}

async function main() {
  ensureEnvironmentFile();
  const [appPort, serverPort] = await allocatePorts();
  await addTokenServerPortToWebApp(serverPort);
  updateTokenServerEnvironment(serverPort);
  updateAppPort(appPort);
}

main();
