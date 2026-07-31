import dedent from 'ts-dedent';

/**
 * Notice shown by the `ui:create:*` commands to inform users that scaffolding
 * has moved to @coveo/create-ui, the supported replacement tool.
 */
export const uiCreateDeprecationNotice = dedent`
  Warning: The ui:create:* commands are deprecated and will be removed in a future release.
  Scaffolding has moved to @coveo/create-ui. Please migrate by running:

    npm create @coveo/ui@latest
`;
