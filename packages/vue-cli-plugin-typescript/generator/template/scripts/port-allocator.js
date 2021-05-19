const getPort = require('get-port');
const {appendFileSync, truncateSync} = require('fs');
const {config} = require('dotenv');
const {EOL} = require('os');
const environment = config();

const preferedWebAppPort = 8080;
const portRangeFallback = [5000, 5999];

const updateEnvFile = () => {
  const env = {
    ...environment.parsed,
    PORT: process.env.PORT,
    VUE_APP_SERVER_PORT: process.env.VUE_APP_SERVER_PORT,
  };

  truncateSync('.env');
  for (const [key, value] of Object.entries(env)) {
    appendFileSync('.env', `${key}=${value}${EOL}`);
  }
};

const allocatePorts = async () => {
  process.env.PORT = await getNextAvailablePorts(
    process.env.PORT || preferedWebAppPort
  );
  process.env.VUE_APP_SERVER_PORT = await getNextAvailablePorts(
    process.env.VUE_APP_SERVER_PORT
  );
  updateEnvFile();
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
