import {Event} from '@amplitude/node';
import {IConfig} from '@oclif/config';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../lib/platform/authenticatedClient';
import {amplitudeClient} from './amplitudeClient';
import {Identifier} from './identifier';
import check from './session';

export interface AnalyticsHook {
  event: Event;
  config: IConfig;
  identify?: boolean;
}

const hook = async function (options: AnalyticsHook) {
  if (!(await canLogEvent())) {
    return;
  }

  const {userId, deviceId, identify} = await new Identifier().getIdentity();
  if (options.identify) {
    amplitudeClient.identify(userId, deviceId, identify);
  }

  amplitudeClient.logEvent({
    device_id: deviceId,
    session_id: check(),
    ...(userId && {user_id: userId}),
    ...options.event,
  });
};

export const flush = async () => {
  await amplitudeClient.flush();
};

const canLogEvent = async () => {
  if (!(await isLoggedIn())) {
    // TODO: track event with anonymous user
    return false;
  }
  const {analyticsEnabled} = await platformInfoIdentifier();

  if (!analyticsEnabled) {
    return false;
  }

  return true;
};

const platformInfoIdentifier = async () => {
  const authenticatedClient = new AuthenticatedClient();
  const config = authenticatedClient.cfg.get();
  return {
    authenticatedClient,
    ...config,
  };
};

const isLoggedIn = async () => {
  const status = await getAuthenticationStatus();
  return status === AuthenticationStatus.LOGGED_IN;
};

export default hook;
