---
'@coveo/cli': minor
---

Deprecate the `ui:create:*` commands (`angular`, `atomic`, `react`, `vue`). Each command now prints a notice pointing to `@coveo/create-ui` (`npm create @coveo/ui@latest`) before scaffolding. Scaffolding behavior is unchanged; the commands will be removed in a future release.
