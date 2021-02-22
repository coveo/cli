import Command from '@oclif/command';
import {IConfig} from '@oclif/config';
import {CoveoAnalyticsClient} from 'coveo.analytics';
import {WebStorage} from 'coveo.analytics/dist/definitions/storage';
import {Config} from '../../lib/config/config';
import {
  AuthenticatedClient,
  AuthenticationStatus,
  getAuthenticationStatus,
} from '../../lib/platform/authenticatedClient';

export interface AnalyticsHook {
  commandID: string;
  flags: Record<string, unknown>;
  config: IConfig;
  err?: Error;
}

const analyticsAPIKey = 'xx01ad67bb-f837-4a3e-8669-16397994a6f2';

const hook = async function (opts: AnalyticsHook) {
  if (!(await isLoggedIn())) {
    return;
  }

  const {eventType, eventValue} = identifier(opts);
  const {
    environment,
    organization,
    region,
    userInfo,
    authenticatedClient,
    analyticsEnabled,
  } = await platformInfoIdentifier();

  if (!analyticsEnabled) {
    return;
  }
  //  TODO: Requires https://github.com/coveo/platform-client/pull/238
  //  We can currently assume that type === TRIAL -> clickwrapped accepted
  //  There will be a new field eventually in the license related to this.
  //  const license = await platformClient.license.full();
  //  if (license.type !== 'TRIAL') {
  //    return;
  //  }

  const analyticsClient = configureAnalyticsClient(authenticatedClient);

  await analyticsClient.sendCustomEvent({
    eventType,
    eventValue,
    customData: {
      flags: JSON.stringify(opts.flags),
      ...errorIdentifier(opts),
      organization,
      os: opts.config.platform,
      environment,
      // TODO: Requires https://github.com/coveo/platform-client/pull/238
      licence_type: 'TRIAL',
      region,
    },
    originLevel1: eventType,
    originLevel2: eventValue,
    userAgent: opts.config.userAgent,
    userDisplayName: userInfo.displayName,
    anonymous: false,
    username: userInfo.username,
    language: 'en',
  });
};

const identifier = (opts: AnalyticsHook) => ({
  eventType: 'com_coveo_cli',
  eventValue: opts.commandID.replace(/:/g, '_'),
});

const errorIdentifier = (opts: AnalyticsHook) => ({
  ...(opts.err && {
    errorMessage: opts.err.message,
    errorName: opts.err.name,
    errorStacktrace: opts.err.stack,
  }),
});

const platformInfoIdentifier = async () => {
  const authenticatedClient = new AuthenticatedClient();
  const platformClient = await authenticatedClient.getClient();
  await platformClient.initialize();

  const userInfo = await platformClient.user.get();
  const config = await authenticatedClient.cfg.get();
  return {
    userInfo,
    authenticatedClient,
    ...config,
  };
};

const configureAnalyticsClient = (authenticatedClient: AuthenticatedClient) => {
  const analyticsClient = new CoveoAnalyticsClient({token: analyticsAPIKey});
  analyticsClient.runtime.storage = storage(authenticatedClient.cfg);
  return analyticsClient;
};

const storage = (cfg: Config): WebStorage => {
  return {
    getItem: async (k) => {
      const configuration = await cfg.get();
      return configuration[k] as string;
    },
    removeItem: (k) => {
      cfg.deleteAny(k);
    },
    setItem: async (k, v) => {
      await cfg.setAny(k, v);
    },
  };
};

const isLoggedIn = async () => {
  const status = await getAuthenticationStatus();
  return status === AuthenticationStatus.LOGGED_IN;
};

export type AnalyticsStatus = 'success' | 'failure';

export const buildAnalyticsHook = (
  cmd: Command,
  status: AnalyticsStatus,
  flags: Record<string, unknown>,
  err?: Error
): AnalyticsHook => {
  return {
    commandID: `${status} ${cmd.id}`,
    config: cmd.config,
    flags,
    err,
  };
};

export const buildAnalyticsSuccessHook = (
  cmd: Command,
  flags: Record<string, unknown>
): AnalyticsHook => {
  return buildAnalyticsHook(cmd, 'success', flags);
};

export const buildAnalyticsFailureHook = (
  cmd: Command,
  flags: Record<string, unknown>,
  err: Error | undefined
): AnalyticsHook => {
  return buildAnalyticsHook(cmd, 'failure', flags, err);
};

export default hook;
