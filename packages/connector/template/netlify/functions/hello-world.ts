import {Handler} from '@netlify/functions';
import HelloWorld, {Args} from '../../src/itemTypes/HelloWorld';

const getArgs: (
  event: Parameters<Handler>[0],
  context: Parameters<Handler>[1]
) => Args = (event, context) => {
  return event.queryStringParameters;
};

export const handler: Handler = async (event, context) => {
  const data = await HelloWorld.call(getArgs(event, context));
  return {
    statusCode: 200,
    body: JSON.stringify(data),
  };
};
