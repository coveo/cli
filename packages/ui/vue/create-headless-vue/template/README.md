# vue-project

This template should help get you started developing your Coveo Search Page with Headless,Vue 3, and Vite.

## Battery optionnaly included

If you generated this project using the [Coveo CLI](https://github.com/coveo/cli), your project should come with a `.env` file with the necessary credentials for you to get started right away.
If you didn't use the Coveo CLI, copy `.example.env` to `.env` and fill it out with the proper information:

- `VITE_COVEO_PLATFORM_URL`: the URL you usually use to use the Coveo APIs, usually `https://platform.cloud.coveo.com`
- `VITE_COVEO_ORGANIZATION_ID`: Your Coveo Organization ID. Check the doc to see [how to retrieve your organization ID](https://docs.coveo.com/en/148/manage-an-organization/retrieve-the-organization-id)
- `PRIVATE_APP_API_KEY`: Your API Key for this Org. We recommend the 'Search' API Key preset.
- `VITE_COVEO_USER_EMAIL`: Your email address. Used for security identities and Analytics.

It is a good practice to **not** include an API Key in your search pages and instead use a server to generate a [Search Token](https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication) using the API Key.
A micro-server is included in the `server` folder for development ease. You can check the code of the microserver here and inspire yourself to create your own for production.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
   1. Run `Extensions: Show Built-in Extensions` from VSCode's command palette
   2. Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
