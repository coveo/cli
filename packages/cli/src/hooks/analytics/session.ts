import {cli} from 'cli-ux';
import {Config} from '../../lib/config/config';

interface SessionOptions {
  duration: number;
}

export const DefaultSessionOptions: SessionOptions = {
  duration: 5 * 60 * 1000,
};

const check = async (overrideOptions?: SessionOptions) => {
  const {duration} = {...DefaultSessionOptions, ...overrideOptions};
  const cfg = new Config(config.configDir, cli.error);
  const configuration = await cfg.get();
  const [startTime, endTime] =
    configuration.amplitudeSession || generate(duration);
  const session = isExpired(endTime) ? Date.now() : startTime;

  cfg.set('amplitudeSession', extend(session, duration));
  return session;
};

const isExpired = (expiryDate: number) => {
  return expiryDate < Date.now();
};

const generate = (duration: number) => {
  return extend(Date.now(), duration);
};

const extend = (startTime: number, duration: number) => {
  const endTime = startTime + duration;
  return [startTime, endTime];
};

export default check;
