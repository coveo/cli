const {PlatformClient} = require('@coveord/platform-client');
const yargs = require('yargs/yargs');
const {hideBin} = require('yargs/helpers');
const moment = require('moment');

const getPlatformHostFromEnv = (env) =>
  `https://platform${env === 'prod' ? '' : env}.cloud.coveo.com`;

function getClient(accessToken, env, organizationId) {
  const host = getPlatformHostFromEnv(env);
  return new PlatformClient({
    ...(organizationId ? {organizationId} : {}),
    accessToken,
    host,
  });
}

function wasCreatedBefore(amount, unit) {
  return (key) => {
    const limit = moment().subtract(amount, unit);
    return moment(key.createdDate).isBefore(limit);
  };
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

const yargGenerator = (resourceName) =>
  yargs(hideBin(process.argv))
    .usage('Usage: $0 [options]')
    .describe(
      'olderThan',
      `Delete ${resourceName} created before the specified date`
    )
    .alias('olderThan', ['o'])
    .default('olderThan', '0s')
    .coerce('olderThan', (arg) => {
      const [amount, unit] = parseDuration(arg);
      return {amount, unit};
    })
    .example(
      '$0 --olderThan 1d',
      `Delete ${resourceName} created before yesterday`
    )
    .help('h')
    .alias('h', 'help').argv;

module.exports = {
  getClient,
  wasCreatedBefore,
  yargGenerator,
};
