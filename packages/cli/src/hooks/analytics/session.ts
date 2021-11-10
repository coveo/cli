import {cli} from 'cli-ux';
import {Config} from '../../lib/config/config';

interface SessionOptions {
  timeout: number;
}

export const DefaultSessionOptions: SessionOptions = {
  timeout: 10 * 60e3,
};

const check = (overrideOptions?: SessionOptions) => {
  const now = Date.now();
  const cfg = new Config(config.configDir, cli.error);
  const {timeout} = {...DefaultSessionOptions, ...overrideOptions};
  const {amplitudeSession, lastEventLoggedTime} = {
    ...{lastEventLoggedTime: now, amplitudeSession: now},
    ...cfg.get(),
  };
  const session = hasBeenToolong(lastEventLoggedTime, now - timeout)
    ? now
    : amplitudeSession;

  cfg.set('amplitudeSession', session);
  cfg.set('lastEventLoggedTime', now);

  return session;
};

const hasBeenToolong = (lastEventFired: number, threshold: number) => {
  console.log(lastEventFired < threshold);
  return lastEventFired < threshold;
};

export default check;
