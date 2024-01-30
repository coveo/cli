# Coveo CLI

<!-- removefromdocs -->

[![Build](https://github.com/coveo/cli/actions/workflows/build.yml/badge.svg)](https://github.com/coveo/cli/actions/workflows/build.yml)

<!-- endremovefromdocs -->

## What Is the Coveo CLI?

The Coveo CLI is a powerful command-line interface (CLI) that interacts with the Coveo platform to facilitate development and build automation.
Key features include the following:

- Quickly create a [Coveo Headless](https://docs.coveo.com/headless)-powered search page for your Coveo organization, relying on popular frameworks like [Angular](https://angular.io), [React](https://reactjs.org/), and [Vue.js](https://vuejs.org/).
- Quickly create a [Coveo Atomic](https://docs.coveo.com/atomic)-powered search page for your Coveo organization, with custom component examples and a search token provider.
- Create and manage Coveo [organizations](https://docs.coveo.com/en/2015).
- Automate deployments between organizations.
- Manage Coveo [Push API](https://docs.coveo.com/en/68) sources.
- Perform [queries](https://docs.coveo.com/en/l25h0358) against a Coveo index.

## When to Use the Coveo CLI?

We recommend the Coveo CLI both to newcomers who are looking for quick scaffolding options and to more seasoned Coveo developers who want to optimize their workflow. With the CLI, developers can get their frontend project started with a single command rather than by copy-pasting examples.
The CLI also lets you automate deployments on your machine or in your CI/CD pipeline using the `org:resources` commands and/or the `source` commands.

Most if not all of those operations can be done either through the Coveo Administration Console or directly using the Coveo REST APIs.
The former, while being easy to understand and get started with, can also be a bit cumbersome and time-consuming for repetitive tasks. The CLI lets you avoid this issue by providing single commands that can accomplish the target tasks, and by allowing you to automate and chain commands together easily.
The REST APIs are on the opposite side of the spectrum: they go straight to the point and avoid any repetition. They can however be quite hard to understand at first and require making numerous and complex requests to different APIs. The CLI can handle most of this complexity for you.

## Installation

### Option 1: Install via an Executable

Download and run the executable for your operating system to install the latest available version of the CLI.

Afterward, you can run `coveo update` at any time to update your CLI installation to the latest version.

- Linux
  - <https://static.cloud.coveo.com/cli/coveo-latest_amd64.deb>
  - <https://static.cloud.coveo.com/cli/coveo-latest_armel.deb>
- Mac
  - <https://static.cloud.coveo.com/cli/coveo-latest-arm64.pkg>
  - <https://static.cloud.coveo.com/cli/coveo-latest-x64.pkg>
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

<!-- usage -->

```sh-session
$ npm install -g @coveo/cli
$ coveo COMMAND
running command...
$ coveo (--version)
@coveo/cli/3.0.16 linux-x64 node-v20.9.0
$ coveo --help [COMMAND]
USAGE
  $ coveo COMMAND
...
```

<!-- usagestop -->

## Getting started

After you install the CLI, you'll typically want to [`login`](https://github.com/coveo/cli/tree/master/packages/cli/core#coveo-authlogin) to your Coveo Organization.
You can check out all the available commands [here](https://github.com/coveo/cli/tree/master/packages/cli/core).

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
./packages/cli/core/bin/dev
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
