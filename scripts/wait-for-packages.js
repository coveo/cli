// https://registry.npmjs.org/@coveo%2fcra-template
const {get} = require('axios');
const {readFileSync} = require('fs');
const retry = require('async-retry');

const publicPackages = [
  '@coveo/search-token-server',
  '@coveo/angular',
  '@coveo/cra-template',
  '@coveo/vue-cli-plugin-typescript',
  '@coveo/lambda-functions',
];

function getExpectedVersion() {
  const lernaJson = JSON.parse(readFileSync('lerna.json', {encoding: 'utf8'}));
  return lernaJson.version;
}

const expectedVersion = getExpectedVersion();
publicPackages.map(async (packageName) => {
  await retry(
    async (_bail) => {
      // if anything throws, we retry
      const res = await get(`https://registry.npmjs.org/${packageName}/latest`);
      const latestVersion = res.data.version;
      console.log(latestVersion);
      if (latestVersion !== expectedVersion) {
        throw `Not the good version yet. Got ${latestVersion}. Expected ${expectedVersion}`;
      }
    },
    {
      maxRetryTime: 10 * 60e3,
      minTimeout: 30e3,
      onRetry: (err) => console.error(err),
    }
  );
});
