import dedent from 'ts-dedent';

/**
 * Notice shown by the `ui:create:*` commands to inform users that scaffolding
 * has moved to @coveo/create-ui, the supported replacement tool.
 *
 * This is printed via `this.warn()`, which already prefixes output with
 * "Warning:", so the notice itself should not repeat that prefix.
 */
export const uiCreateDeprecationNotice = dedent`
  The ui:create:* commands are deprecated and will be removed in a future release.
  Scaffolding has moved to @coveo/create-ui. Please migrate by running:

    npm create @coveo/ui@latest
`;
