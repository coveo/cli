const getPort = require('get-port');
const {appendFileSync, truncateSync} = require('fs');
const {config} = require('dotenv');
const {EOL} = require('os');
const environment = config();

const preferedWebAppPort = 8080;
const portRangeFallback = [5000, 5999];

const updateEnvFile = (applicationPort, serverPort) => {
  const env = {
    ...environment.parsed,
    PORT: applicationPort,
    VUE_APP_SERVER_PORT: serverPort,
  };

  truncateSync('.env');
  for (const [key, value] of Object.entries(env)) {
    appendFileSync('.env', `${key}=${value}${EOL}`);
  }
};

const allocatePorts = async () => {
  const applicationPort = await getNextAvailablePorts(
    process.env.PORT || preferedWebAppPort
  );
  const serverPort = await getNextAvailablePorts(
    process.env.VUE_APP_SERVER_PORT
  );
  updateEnvFile(applicationPort, serverPort);
};

const getNextAvailablePorts = async (preferedPort) => {
  if (typeof preferedPort !== 'number') {
    preferedPort = isNaN(parseInt(preferedPort))
      ? null
      : parseInt(preferedPort);
  }

  if (await isPortAvailable(preferedPort)) {
    return preferedPort;
  }
  return await getPort({port: getPort.makeRange(...portRangeFallback)});
};

const isPortAvailable = async (port) => {
  const availablePort = await getPort({port});
  return availablePort === port;
};

allocatePorts();
