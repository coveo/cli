import {init, Event} from '@amplitude/node';
import {IConfig} from '@oclif/config';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../lib/platform/authenticatedClient';

export interface AnalyticsHook {
  event: Event;
  config: IConfig;
}

// TODO: CDX-651 track user properties
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

const configureAmplitudeClient = () => {
  // TODO: CDX-667: support proxy
  const amplitudeClient = init(analyticsAPIKey);
  return amplitudeClient;
};

const isLoggedIn = async () => {
  const status = await getAuthenticationStatus();
  return status === AuthenticationStatus.LOGGED_IN;
};

export default hook;
