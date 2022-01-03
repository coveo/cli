import {cli} from 'cli-ux';
import {buildEvent} from '../../hooks/analytics/eventUtils';
import {ProcessAbort} from '../errors/processError';

interface ConfirmOptions {
  /**
   * Whether to terminate the process when the user does not confirm the action.
   */
  exit?: boolean;
  /**
   * Used for analytics purposes to name the action. Should not contain sensitive information.
   * See https://coveord.atlassian.net/wiki/spaces/RD/pages/2214168207/Amplitude for taxonomy
   */
  eventName?: string;
}

/**
 *
 * @param question The question requiring a confirmation
 * @param options
 */
export async function confirm(
  question: string,
  options: ConfirmOptions
): Promise<boolean> {
  const doAction = await cli.confirm(question);
  if (doAction) {
    trackEvent(`confirmed ${options.eventName}`);
    return true;
  } else {
    trackEvent(`cancelled ${options.eventName}`);
    if (options.exit) {
      throw new ProcessAbort();
    }
    return false;
  }
}

async function trackEvent(eventName?: string) {
  const defaultEventName = 'confirmation';
  await config.runHook('analytics', {
    event: buildEvent(`cancelled ${eventName || defaultEventName}`, {}),
  });
}
