const {axios} = require('axios');
const {homedir} = require('os');
const {join} = require('path');
const {config} = require('dotenv');
config({path: join(homedir(), '.env')});

// TODO: CDX-98: URL should vary in function of the target environment.
const platformHost = 'https://platformdev.cloud.coveo.com/rest/';

function authHeader(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

async function deleteTestOrg(orgId, accessToken) {
  if (orgId === 'connectorsteamtestsmf76kcam') {
    throw new Error('Au bûcher! Au bûcher!');
  }

  await axios.delete(
    `${platformHost}organizations/${orgId}`,
    authHeader(accessToken)
  );
}

async function main() {
  const testOrgId = process.env.TEST_ORG_ID;
  const accessToken = process.env.ACCESS_TOKEN;
  await deleteTestOrg(testOrgId, accessToken);
}

main();
