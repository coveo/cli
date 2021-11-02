// See https://stackoverflow.com/questions/68322578/recent-updated-version-of-types-node-is-creating-an-error-the-previous-versi
/* eslint-disable no-var */

import '@oclif/command';

declare module '@oclif/command' {
  export default abstract class Command {
    /**
     * Command title used to identify the command.
     * The expression should go as follows: *(Subject) (Process?) ( - Sub-Process?)*
     *
     * Ex.:
     * - organization pull
     * - search page create
     *
     * If populated, the Command title will be used to identify all events fired from that same command
     * If not defined, the Command ID will be used instead.
     * However, for long commands, we recommend populating the title value to prevent having event names such as `org resources pull model new`.
     *
     * Visit https://coveord.atlassian.net/wiki/spaces/RD/pages/2855141440/New+Taxonomy+Definition for more info
     */
    public static title: string | undefined;
  }
}
