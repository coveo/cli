import {Config} from '../../lib/config/config';

interface SessionOptions {
  /**
   * The time interval after which a user session times out.
   * Default value is 30 minutes.
   */
  timeout: number;
}

export const DefaultSessionOptions: SessionOptions = {
  timeout: 30 * 60e3,
};

/**
 * Checks if the user session is valid.
 * The current session ID will be returned if valid.
 * Otherwise, a new session ID will be generated.
 *
 * The time window after which a session times out can be customized via the SessionOptions
 *
 * @param {SessionOptions} [overrideOptions]
 * @returns {number} a valid session ID
 */
const check = (overrideOptions?: SessionOptions): number => {
  const now = Date.now();
  const cfg = new Config();
  const {timeout} = {...DefaultSessionOptions, ...overrideOptions};
  const {amplitudeSessionID, lastEventLoggedTime} = {
    ...{lastEventLoggedTime: now, amplitudeSessionID: now},
    ...cfg.get(),
  };
  const sessionID = hasBeenToolong(lastEventLoggedTime, now - timeout)
    ? now
    : amplitudeSessionID;

  cfg.set('amplitudeSessionID', sessionID);
  cfg.set('lastEventLoggedTime', now);

  return sessionID;
};

const hasBeenToolong = (lastEventFired: number, threshold: number) => {
  return lastEventFired < threshold;
};

export default check;
