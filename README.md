# Coveo CLI

[![Build](https://github.com/coveo/cli/actions/workflows/build.yml/badge.svg)](https://github.com/coveo/cli/actions/workflows/build.yml)

## About

Coveo CLI is a command line interface to interact with the Coveo platform. It allows you to quickly create a [Coveo Headless](https://docs.coveo.com/headless)-powered search page for your Coveo organization, relying on [Angular](https://angular.io), [React](https://reactjs.org/) or [Vue.js](https://vuejs.org/).

## Usage

Installation links:

Mac:

- https://static.cloud.coveo.com/cli/coveo-latest.pkg

Windows:

- https://static.cloud.coveo.com/cli/coveo-latest-x64.exe
- https://static.cloud.coveo.com/cli/coveo-latest-x32.exe

Linux:

- https://static.cloud.coveo.com/cli/coveo-latest_amd64.deb
- https://static.cloud.coveo.com/cli/coveo-latest_armel.deb

These executables install the latest available version. Afterwards, anytime you run `coveo update`, your CLI installation will update to the latest version.

If you have [installed node-gyp](https://github.com/nodejs/node-gyp#installation), you can alternatively install globally via [npm](https://www.npmjs.com/package/@coveo/cli):

```sh
npm install -g @coveo/cli
```

Afterwards, anytime you run `coveo update`, your CLI installation will also update to the latest version.

With node-gyp, you can also run via [npx](https://www.npmjs.com/package/npx):

```sh
npx @coveo/cli
```

In practice, you'll typically want to [`login`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-authlogin) to your Coveo Organization, [`configure`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-configset) the CLI to connect to this organization, and finally create a search page (see [`coveo ui:create:angular NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreateangular-name), [`coveo ui:create:react NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreatereact-name) and [`coveo ui:create:vue NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreatevue-name)).

The project is still under heavy development and more features are coming, stay tuned!

## Local Setup to Contribute

To install all dependencies and link local packages, run:

```sh
npm run setup
```

To run the local version of the CLI

```sh
./packages/cli/bin/run
```

To build all projects for production, run:

```sh
npm run build
```

To run unit tests

```sh
npm run test
```
