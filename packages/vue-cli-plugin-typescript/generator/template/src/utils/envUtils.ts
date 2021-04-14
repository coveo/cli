interface ValidEnvironment extends NodeJS.ProcessEnv {
  VUE_APP_PLATFORM_URL: string;
  VUE_APP_ORGANIZATION_ID: string;
  VUE_APP_API_KEY: string;
  VUE_APP_USER_EMAIL: string;
  VUE_APP_TOKEN_ENDPOINT: string;
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
    'VUE_APP_TOKEN_ENDPOINT',
  ];
  const reducer = (previousValue: boolean, currentValue: string) =>
    previousValue && env[currentValue] !== undefined;
  return variables.reduce(reducer, true);
}
