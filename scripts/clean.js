// function authHeader(accessToken) {
//   return {
//     headers: {
//       Authorization: `Bearer ${accessToken}`,
//     },
//   };
// }

// async function deleteApiKeys() {
//   // TODO:
// }

function deleteTestOrg(orgId, _accessToken) {
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
  const orgId = `cli-e2e-${process.env.TEST_RUN_ID}`;
  const accessToken = 'TODO:';
  // await deleteApiKeys();
  deleteTestOrg(orgId, accessToken);
}

main();
