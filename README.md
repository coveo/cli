# Coveo CLI

<!-- removefromdocs -->

[![Build](https://github.com/coveo/cli/actions/workflows/build.yml/badge.svg)](https://github.com/coveo/cli/actions/workflows/build.yml)

<!-- endremovefromdocs -->

## About

Coveo CLI is a command line interface to interact with the Coveo platform. With this tool, you are able to create [Coveo Headless](https://docs.coveo.com/headless)-powered search pages, push data to your organization, automate resource deployments, and create your own test organizations.

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

## Usage

You can check out the available commands [here](https://github.com/coveo/cli/tree/master/packages/cli).

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

<!-- endremovefromdocs -->
