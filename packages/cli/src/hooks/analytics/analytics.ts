import Command from '@oclif/command';
import {IConfig} from '@oclif/config';
import {CoveoAnalyticsClient} from 'coveo.analytics';
import {WebStorage} from 'coveo.analytics/dist/definitions/storage';
import {Config} from '../../lib/config/config';
import {AuthenticatedClient} from '../../lib/platform/authenticatedClient';

export interface AnalyticsHook {
  commandID: string;
  flags: Record<string, unknown>;
  config: IConfig;
  meta?: Record<string, unknown>;
}

const analyticsAPIKey = 'xx01ad67bb-f837-4a3e-8669-16397994a6f2';

const hook = async function (opts: AnalyticsHook) {
  const authenticatedClient = new AuthenticatedClient();
  const platformClient = await authenticatedClient.getClient();
  await platformClient.initialize();

  // TODO: Requires https://github.com/coveo/platform-client/pull/238
  // We can currently assume that type === TRIAL -> clickwrapped accepted
  // There will be a new field eventually in the license related to this.
  //const license = await platformClient.license.full();
  //if (license.type !== 'TRIAL') {
  //  return;
  //}

  const userInfo = await platformClient.user.get();
  const {organization} = await authenticatedClient.cfg.get();

  const analyticsClient = new CoveoAnalyticsClient({token: analyticsAPIKey});
  analyticsClient.runtime.storage = storage(authenticatedClient.cfg);
  console.log(
    await analyticsClient.sendCustomEvent({
      eventType: `com.coveo.cli ${opts.commandID}`,
      eventValue: opts.commandID,
      customData: {
        ...opts.flags,
        ...opts.meta,
        organization,
        platform: opts.config.platform,
      },
      userAgent: opts.config.userAgent,
      userDisplayName: userInfo.displayName,
      language: 'en',
    })
  );
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

export type AnalyticsStatus = 'success' | 'failure';

export const buildAnalyticsHook = (
  cmd: Command,
  status: AnalyticsStatus,
  flags: Record<string, unknown>,
  meta?: Record<string, unknown>
): AnalyticsHook => {
  return {
    commandID: `${status}_${cmd.id}`,
    config: cmd.config,
    flags,
    meta,
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
  return buildAnalyticsHook(cmd, 'failure', flags, {...err});
};

export default hook;
