# Coveo CLI

<!-- removefromdocs -->

[![Build](https://github.com/coveo/cli/actions/workflows/build.yml/badge.svg)](https://github.com/coveo/cli/actions/workflows/build.yml)

<!-- endremovefromdocs -->

## What is it?

The Coveo CLI is a powerful command-line interface (CLI) that interacts with the Coveo platform to facilitate development and build automation.
Key features include the following:

- Quickly create a [Coveo Headless](https://docs.coveo.com/headless)-powered search page for your Coveo organization, relying on popular frameworks like [Angular](https://angular.io), [React](https://reactjs.org/), and [Vue.js](https://vuejs.org/).
- Create and manage Coveo [organizations](https://docs.coveo.com/en/2015)
- Automate deployments between organizations
- Manage Coveo [Push API](https://docs.coveo.com/en/68) sources
- Perform [queries](https://docs.coveo.com/en/l25h0358) against a Coveo index

## Installation

### Option 1: Install via an Executable

Download and run the executable for your operating system to install the latest available version of the CLI.

Afterward, you can run `coveo update` at any time to update your CLI installation to the latest version.

- Linux
  - <https://static.cloud.coveo.com/cli/coveo-latest_amd64.deb>
  - <https://static.cloud.coveo.com/cli/coveo-latest_armel.deb>
- Mac
  - <https://static.cloud.coveo.com/cli/coveo-latest.pkg>
- Windows
  - <https://static.cloud.coveo.com/cli/coveo-latest-x64.exe>
  - <https://static.cloud.coveo.com/cli/coveo-latest-x32.exe>

### Option 2: Install via NPM

You can alternatively install the CLI globally via [npm](https://www.npmjs.com/package/@coveo/cli):

```sh
npm install -g @coveo/cli
```

Afterward, you can run `npm update -g @coveo/cli` at any time to update your npm-based CLI installation to the latest version.

You can also run the CLI via [npx](https://www.npmjs.com/package/npx):

```sh
npx @coveo/cli
```

<!-- removefromdocs -->

## Validating your installation

To validate your CLI installation, use the `coveo --version` command:

```
$ coveo --version
@coveo/cli/1.19.0 darwin-x64 node-v16.10.0
```

## Getting started

After you install the CLI, you'll typically want to [`login`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-authlogin) to your Coveo Organization.
You can check out all the available commands [here](https://github.com/coveo/cli/tree/master/packages/cli).

<!--
  Add full examples for each use case:
  TODO: CDX-492 One example to explain how to use org:resources commands.
  Similar to the SFDX CLI intro (https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
-->

The project is still under heavy development and more features are coming, stay tuned!

## Local Setup to Contribute

To install all dependencies and link local packages, run:

```sh
npm i
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

<!-- endremovefromdocs -->
