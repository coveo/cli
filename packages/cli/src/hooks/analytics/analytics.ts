import {validate} from 'jsonschema';
import {init, Event} from '@amplitude/node';
import {IConfig} from '@oclif/config';
import {APIError, APIErrorResponse} from '../../lib/errors/APIError';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../lib/platform/authenticatedClient';

export interface AnalyticsHook {
  event: Event;
  config: IConfig;
}

// import {Identifier} from './identifier';

// TODO: CDX-656: replace with Production API key on build
const analyticsAPIKey = '2b06992f1a80d36396ba7297a8daf913';

const hook = async function (options: AnalyticsHook) {
  const {event} = options;
  if (!(await isLoggedIn())) {
    // TODO: track event with anonymous user
    return;
  }
  const amplitudeClient = configureAmplitudeClient();
  // TODO: CDX-651: Identify unique users
  const {organization, analyticsEnabled} = await platformInfoIdentifier();

  if (!analyticsEnabled) {
    return;
  }
  const platformClient = await new AuthenticatedClient().getClient({
    organization,
  });
  const license = await platformClient.license.full();
  if (license.type !== 'TRIAL') {
    return;
  }

  amplitudeClient.logEvent(event);
};

const platformInfoIdentifier = async () => {
  const authenticatedClient = new AuthenticatedClient();
  const platformClient = await authenticatedClient.getClient();
  await platformClient.initialize();
  const config = authenticatedClient.cfg.get();
  let userInfo;
  if (!config.anonymous) {
    userInfo = await platformClient.user.get();
  }
  return {
    userInfo,
    authenticatedClient,
    ...config,
  };
};

const errorIdentifier = (err?: Error) => ({
  ...(err && {
    errorMessage: err.message,
    errorName: err.name,
  }),
});

const configureAmplitudeClient = () => {
  // TODO: CDX-667: support proxy
  const amplitudeClient = init(analyticsAPIKey);
  return amplitudeClient;
};

const isLoggedIn = async () => {
  const status = await getAuthenticationStatus();
  return status === AuthenticationStatus.LOGGED_IN;
};

export const buildEvent = (
  eventName: string,
  properties: Record<string, unknown>,
  err?: Error
): Event => {
  const analyticsData = {
    event_type: eventName,
    event_properties: {
      ...properties,
      ...errorIdentifier(err),
    },
  };

  return analyticsData;
};

export const buildError = (arg: unknown) => {
  /**
   * TODO: CDX-660: Make sure to remove any PII from the Error object.
   *       error.message could contain data that is not allowed to be tracked for non-Trial users
   *       example: orgID, sourceID, ...
   */
  if (arg instanceof Error) {
    return arg;
  }

  if (typeof arg === 'string') {
    return new Error(arg);
  }

  const schema = {
    message: 'string',
    errorCode: 'string',
    requestID: 'string',
  };
  const isErrorFromAPI = validate(arg, schema);
  return isErrorFromAPI
    ? new APIError(arg as APIErrorResponse)
    : new Error('Unknown Error');
};

export default hook;
