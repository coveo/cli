export const npmPathEnvVar = 'E2E_NPM_PATH';
export const npmCachePathEnvVar = 'E2E_NPM_CACHE_PATH';
export const npm = () => ['node', process.env[npmPathEnvVar]!];
