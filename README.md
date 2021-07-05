# Coveo CLI

[![Build](https://github.com/coveo/cli/actions/workflows/build.yml/badge.svg)](https://github.com/coveo/cli/actions/workflows/build.yml)

## About

Coveo CLI is a command line interface to interact with the Coveo platform. It allows you to quickly create a [Coveo Headless](https://docs.coveo.com/headless)-powered search page for your Coveo organization, relying on [Angular](https://angular.io), [React](https://reactjs.org/) or [Vue.js](https://vuejs.org/).

## Installation

### Option 1: Install via an Executable

Download and run the executable for your operating system to install the latest available version of the CLI.

Afterward, you can run `coveo update` at any time to update your CLI installation to the latest version.

- Linux
  - https://static.cloud.coveo.com/cli/coveo-latest_amd64.deb
  - https://static.cloud.coveo.com/cli/coveo-latest_armel.deb
- Mac
  - https://static.cloud.coveo.com/cli/coveo-latest.pkg
- Windows
  - https://static.cloud.coveo.com/cli/coveo-latest-x64.exe
  - https://static.cloud.coveo.com/cli/coveo-latest-x32.exe

### Option 2: Install via NPM

If you have [installed node-gyp](https://github.com/nodejs/node-gyp#installation), you can alternatively install globally via [npm](https://www.npmjs.com/package/@coveo/cli):

```sh
npm install -g @coveo/cli
```

Afterward, you can run `npm update -g @coveo/cli` at any time to update your npm-based CLI installation to the latest version.

With node-gyp, you can also run the CLI via [npx](https://www.npmjs.com/package/npx):

```sh
npx @coveo/cli
```

## Usage

In practice, you'll typically want to [`login`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-authlogin) to your Coveo Organization, [`configure`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-configset) the CLI to connect to this organization, and finally create a search page (see [`coveo ui:create:angular NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreateangular-name), [`coveo ui:create:react NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreatereact-name) and [`coveo ui:create:vue NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreatevue-name)).

You can check out the other commands [here](https://github.com/coveo/cli/tree/master/packages/cli).

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
