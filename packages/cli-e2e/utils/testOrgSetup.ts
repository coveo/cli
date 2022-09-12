import {getConfig as getCliConfig} from './cli';
import {createOrg} from './platform';

export async function getTestOrg() {
  const testOrgName = `cli-e2e-${process.env.TEST_RUN_ID}`;
  const {accessToken} = getCliConfig();
  const testOrgId = await createOrg(testOrgName, accessToken);
  console.log(`Created org ${testOrgId}`);

  return testOrgId;
}
