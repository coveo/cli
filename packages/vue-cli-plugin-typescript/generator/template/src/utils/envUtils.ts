import {config} from 'dotenv';
config();

interface ValidEnvironment extends NodeJS.ProcessEnv {
  VUE_APP_PLATFORM_URL: string;
  VUE_APP_ORGANIZATION_ID: string;
  VUE_APP_API_KEY: string;
  VUE_APP_USER_EMAIL: string;
  VUE_APP_SERVER_PORT: string;
}

/**
 * Making sure all environment variables are defined
 *
 * @returns true if the .env file is valid. false otherwise.
 */
export function isEnvValid(env: NodeJS.ProcessEnv): env is ValidEnvironment {
  const variables = [
    'VUE_APP_PLATFORM_URL',
    'VUE_APP_ORGANIZATION_ID',
    'VUE_APP_API_KEY',
    'VUE_APP_USER_EMAIL',
    'VUE_APP_SERVER_PORT',
  ];
  const reducer = (previousValue: boolean, currentValue: string) =>
    previousValue && env[currentValue] !== undefined;
  return variables.reduce(reducer, true);
}

function getEndpointToLocalServer() {
  if (!process.env.VUE_APP_SERVER_PORT) {
    throw new Error('Undefined "VUE_APP_SERVER_PORT" environment variable');
  }
  const port = process.env.VUE_APP_SERVER_PORT;
  const pathname = '/token';
  return `http://localhost:${port}${[pathname]}`;
}

export function getTokenEndpoint() {
  return process.env.VUE_APP_TOKEN_ENDPOINT || getEndpointToLocalServer();
}
