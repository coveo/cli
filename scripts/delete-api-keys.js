require('isomorphic-fetch');
require('abortcontroller-polyfill');
const {Environment, PlatformClient} = require('@coveord/platform-client');
const yargs = require('yargs/yargs');
const moment = require('moment');
const {hideBin} = require('yargs/helpers');
const {homedir} = require('os');
const {join} = require('path');
const {config} = require('dotenv');
const {existsSync, readdirSync} = require('fs');
config({path: join(__dirname, '..', 'packages', 'cli-e2e', '.env')});

function wasCreatedByTheCli(testRunId = '') {
  return (key) =>
    key.displayName?.startsWith(`cli-${testRunId}`) &&
    key.description === 'Generated by the Coveo CLI';
}

function wasCreatedBefore(amount, unit) {
  return (key) => {
    const limit = moment().subtract(amount, unit);
    return moment(key.createdDate).isBefore(limit);
  };
}

async function deleteApiKeys(platform, apiKeysToDelete) {
  for (let i = 0; i < apiKeysToDelete.length; i++) {
    const apiKey = apiKeysToDelete[i];
    console.log(`Deleting ${apiKey.displayName}`);
    await platform.apiKey.delete(apiKey.id);
  }
  console.log(`\nDeleted ${apiKeysToDelete.length} API keys`);
}

function parseDuration(input) {
  const durationRegex = /(\d+)([a-zA-Z]+)/;
  const match = durationRegex.exec(input);
  if (match) {
    return [match[1], match[2]];
  }
  throw new Error(
    'Invalid input. Should follow the format <Amount:number><Unit:unitOfTime>. For more info on duration, visit https://momentjs.com/docs/#/durations/creating/'
  );
}

function getClient(organizationId, accessToken) {
  return new PlatformClient({
    organizationId,
    accessToken,
    environment: Environment.dev, // TODO: CDX-98: URL should vary in function of the target environment.
  });
}

async function main(amount, unit) {
  const testOrgId = process.env.TEST_ORG_ID;
  const accessToken = process.env.ACCESS_TOKEN;
  const testRunId = process.env.TEST_RUN_ID;
  console.log('********* testRunId *********');
  console.log(testRunId);
  console.log(existsSync(join(__dirname, '..', 'packages', 'cli-e2e', '.env')));
  console.log('*****************************');

  const platform = getClient(testOrgId, accessToken);
  const apiKeys = await platform.apiKey.list();

  const cliApiKeys = apiKeys
    .filter(wasCreatedByTheCli(testRunId))
    .filter(wasCreatedBefore(amount, unit));

  await deleteApiKeys(platform, cliApiKeys);
}

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 [options]')
  .describe('olderThan', 'Delete API keys created before the specified date')
  .alias('olderThan', ['o'])
  .default('olderThan', '0s')
  .coerce('olderThan', (arg) => {
    const [amount, unit] = parseDuration(arg);
    return {amount, unit};
  })
  .example('$0 --olderThan 1d', 'Delete API keys created before yesterday')
  .help('h')
  .alias('h', 'help').argv;

const {amount, unit} = argv.olderThan;
console.log({amount, unit});
main(amount, unit);
