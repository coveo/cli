import {init, Event} from '@amplitude/node';
import {IConfig} from '@oclif/config';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../lib/platform/authenticatedClient';
import {Identifier} from './identifier';

export interface AnalyticsHook {
  event: Event;
  config: IConfig;
}

// TODO: CDX-656: replace with Production API key on build
const analyticsAPIKey = '2b06992f1a80d36396ba7297a8daf913';

const hook = async function (options: AnalyticsHook) {
  if (!(await isLoggedIn())) {
    // TODO: track event with anonymous user
    return;
  }
  const amplitudeClient = configureAmplitudeClient();
  const {organization, analyticsEnabled, authenticatedClient} =
    await platformInfoIdentifier();

  if (!analyticsEnabled) {
    return;
  }

  // TODO: CDX-676: remove this block to track events from all org types
  // ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓
  const platformClient = await authenticatedClient.getClient({
    organization,
  });
  const license = await platformClient.license.full();

  if (license.productType !== 'TRIAL') {
    return;
  }
  // ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑

  const identifier = new Identifier(amplitudeClient);
  const {userId, deviceId} = await identifier.identify();
  await amplitudeClient.logEvent({
    device_id: deviceId,
    ...(userId && {user_id: userId}),
    ...options.event,
  });
};

const platformInfoIdentifier = async () => {
  const authenticatedClient = new AuthenticatedClient();
  const config = authenticatedClient.cfg.get();
  return {
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
