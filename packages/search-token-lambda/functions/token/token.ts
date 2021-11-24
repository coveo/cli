import {areEnvironmentVariablesSet} from './areEnvironmentVariablesSet';
import {generateToken} from './generateToken';

export const handler = async () => {
  if (!areEnvironmentVariablesSet()) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        error:
          'Make sure to configure the environment variables in the ".env" file. Refer to the README to set up the server.',
      }),
    };
  }

  const token = await generateToken();
  if (!token) {
    return {
      statusCode: 500,
      body: JSON.stringify({error: 'Error generating token.'}),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({token}),
  };
};
