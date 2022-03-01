import {getConfig as getCliConfig, getEnvFilePath} from './cli';
import {saveToEnvFile} from './file';
import {createOrg, getPlatformHost} from './platform';

export async function getTestOrg() {
  const testOrgName = `cli-e2e-${process.env.TEST_RUN_ID}`;
  const {accessToken} = getCliConfig();
  const testOrgId = await createOrg(testOrgName, accessToken);
  console.log(`Created org ${testOrgId}`);
  const pathToEnv = getEnvFilePath();
  saveToEnvFile(pathToEnv, {
    PLATFORM_ENV: process.env.PLATFORM_ENV,
    PLATFORM_HOST: getPlatformHost(process.env.PLATFORM_ENV || ''),
    TEST_RUN_ID: process.env.TEST_RUN_ID,
    TEST_ORG_ID: testOrgName,
    ACCESS_TOKEN: accessToken,
  });

  return testOrgName;
}
