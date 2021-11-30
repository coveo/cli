const axios = require('axios');
const {homedir} = require('os');
const {join} = require('path');
const {config} = require('dotenv');
config({path: join(homedir(), '.env')});

function authHeader(accessToken) {
  return {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
}

async function deleteTestOrg(orgId, accessToken, platformHost) {
  const toNotDelete = ['qaregression2', 'connectorsteamtestsmf76kcam'];
  if (toNotDelete.includes(orgId)) {
    throw new Error('Au bûcher! Au bûcher!');
  }

  if (orgId) {
    console.log(`Deleting org ${orgId}`);
    const url = new URL(`/organizations/${orgId}`, platformHost);
    await axios.delete(url.href, authHeader(accessToken));
  } else {
    console.log('No org to delete');
  }
}

async function main() {
  const {
    TEST_ORG_ID: testOrgId,
    ACCESS_TOKEN: accessToken,
    PLATFORM_HOST: platformHost,
  } = process.env;
  await deleteTestOrg(testOrgId, accessToken, platformHost);
}

main();
