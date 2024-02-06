const {homedir} = require('os');
const {join} = require('path');
const {config} = require('dotenv');
const {getClient, yargGenerator, wasCreatedBefore} = require('./utils');
config({path: join(homedir(), '.env')});

async function deleteNgsp(platform, idsToDelete) {
  for (const id of idsToDelete) {
    console.log(`Deleting ${id}`);
    await platform.nextGenSearchPages.delete(id);
  }
  console.log(`\nDeleted ${idsToDelete.length} API keys`);
}

async function main(amount, unit) {
  const {
    ORG_ID: testOrgId,
    TEST_RUN_ID: testRunId,
    PLATFORM_API_KEY: accessToken,
    PLATFORM_ENV: env,
  } = process.env;
  const platform = getClient(accessToken, env, testOrgId);
  try {
    const pages = await platform.nextGenSearchPages.list({filter: 'cli-id'});

    const cliApiKeys = pages
      .filter(page=>page.name.includes(testRunId))
      .filter(wasCreatedBefore(amount, unit));

    await deleteNgsp(platform, cliApiKeys);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const argv = yargGenerator('NGSP');

const {amount, unit} = argv.olderThan;
main(amount, unit);
