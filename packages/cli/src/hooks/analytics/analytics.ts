import {Event} from '@amplitude/node';
import {Interfaces} from '@oclif/core';
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
  config: Interfaces.Config;
  identify?: boolean;
}

const hook = async function (options: AnalyticsHook) {
  if (!(await isLoggedIn())) {
    // TODO: track event with anonymous user
    return;
  }
  const platformIdentifier = await platformInfoIdentifier();

  if (!platformIdentifier.analyticsEnabled) {
    return;
  }

  const {userId, deviceId, identify} = await new Identifier().getIdentity();
  if (options.identify) {
    identify(amplitudeClient);
  }

  await augmentEvent(options.event, platformIdentifier);
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

const augmentEvent = async (
  event: Event,
  identifier: Awaited<ReturnType<typeof platformInfoIdentifier>>
) => {
  const {organization, authenticatedClient, environment, region} = identifier;
  const platformClient = await authenticatedClient.getClient({
    organization,
  });
  const {type} = await platformClient.organization.get(organization);

  event.event_properties = {
    ...event.event_properties,
    organization_type: type,
    environment,
    region,
  };
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
