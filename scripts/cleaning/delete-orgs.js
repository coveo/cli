require('isomorphic-fetch');
require('abortcontroller-polyfill');

const {homedir} = require('os');
const {join} = require('path');
const {config} = require('dotenv');
const {
  getClient,
  yargGenerator,
  wasCreatedBefore,
  getCliConfig,
} = require('./utils');
config({path: join(homedir(), '.env')});

function wasCreatedByTheCli(testRunId = '') {
  return (key) =>
    testRunId
      ? key.displayName?.startsWith(`cli-${testRunId}`)
      : key.displayName?.match(/cli-id.*g/);
}

async function deleteTestOrgs(platform, cliOrgs) {
  for (const cliOrg of cliOrgs) {
    const toNotDelete = ['qaregression2', 'connectorsteamtestsmf76kcam'];
    if (toNotDelete.includes(cliOrg)) {
      throw new Error('Au bûcher! Au bûcher!');
    }
    console.log(`Deleting ${cliOrg.displayName}`);
    await platform.organization.delete(cliOrg.id);
  }
  console.log(`\nDeleted ${cliOrgs.length} organization`);
}

async function main() {
  const {TEST_RUN_ID: testRunId, PLATFORM_ENV: env} = process.env;
  const accessToken = getCliConfig().accessToken;
  const platform = getClient(accessToken, env);
  try {
    const orgs = await platform.organization.list();
    const cliOrgs = orgs
      .filter(wasCreatedByTheCli(testRunId))
      .filter(wasCreatedBefore(amount, unit));

    await deleteTestOrgs(platform, cliOrgs);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const argv = yargGenerator('Organization');

const {amount, unit} = argv.olderThan;
main(amount, unit);
