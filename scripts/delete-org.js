const {config} = require('dotenv');
const {homedir} = require('os');
const {join} = require('path');
config({path: join(homedir(), '.env')});

// function authHeader(accessToken) {
//   return {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   };
// }

async function deleteTestOrg(orgId, _accessToken) {
  if (orgId === 'connectorsteamtestsmf76kcam') {
    throw new Error('Au bûcher! Au bûcher!');
  }
  console.log('*********************');
  console.log(`deleteting org: ${orgId}`);
  console.log('*********************');

  // await axios.delete(
  //   `${hostname()}organizations/${orgId}`,
  //   authHeader(accessToken)
  // );
}

async function main() {
  const testOrgId = process.env.TEST_ORG_ID;
  const accessToken = process.env.ACCESS_TOKEN;
  await deleteTestOrg(testOrgId, accessToken);
}

main();
