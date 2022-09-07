import {Event} from '@amplitude/node';
import {Interfaces} from '@oclif/core';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '@coveo/cli-commons/platform/authenticatedClient';
import {amplitudeClient} from './amplitudeClient';
import {Identifier} from './identifier';

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

  const {userId, deviceId, identify} = await new Identifier().getIdentity();
  if (options.identify) {
    identify(amplitudeClient);
  }

  await augmentEvent(options.event, platformIdentifier);
  amplitudeClient.logEvent({
    device_id: deviceId,
    ...(userId && {user_id: userId}),
    ...options.event,
  });
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
