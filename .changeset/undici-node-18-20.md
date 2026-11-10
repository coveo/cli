---
'@coveo/cli-commons': patch
'@coveo/cli': patch
---

Fix fresh installs crashing on Node 18 and 20 with `TypeError: Cannot read properties of undefined (reading 'bind')`. `@coveo/cli` no longer depends on `fetch-undici-polyfill`, which installed `undici@latest` (undici 8 needs Node 22.19 or later). `@coveo/cli-commons` now declares the `undici` it uses for `HTTPS_PROXY` support, pinned to 6.29.1, the newest major that runs on every Node version the CLI supports.
