import {confirm} from '@coveo/cli-commons/utils/ux';

import globalConfig from '@coveo/cli-commons/config/globalConfig';
import {buildEvent} from '@coveo/cli-commons/analytics/eventUtils';

/**
 *
 * @param message confirmation prompt (yes/no)
 * @param questionName Used for analytics purposes to name the action. Should not contain sensitive information.
 * See https://coveord.atlassian.net/wiki/spaces/RD/pages/2214168207/Amplitude for taxonomy
 * @returns
 */
export async function confirmWithAnalytics(
  message: string,
  questionName: string
): Promise<boolean> {
  const doAction = await confirm(message, false);
  if (doAction) {
    trackEvent(`confirmed ${questionName}`);
    return true;
  } else {
    trackEvent(`cancelled ${questionName}`);
    return false;
  }
}

async function trackEvent(questionName: string) {
  await globalConfig.get().runHook('analytics', {
    event: buildEvent(questionName, {}),
  });
}
