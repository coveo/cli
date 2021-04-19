# Coveo CLI

[![Build](https://github.com/coveo/cli/actions/workflows/build.yml/badge.svg)](https://github.com/coveo/cli/actions/workflows/build.yml)

## About

Coveo CLI is a command line interface to interact with the Coveo platform. It allows you to quickly create a [Coveo Headless](https://docs.coveo.com/headless)-powered search page for your Coveo organization, relying on [Angular](https://angular.io), [React](https://reactjs.org/) or [Vue.js](https://vuejs.org/).

## Usage

Install via npm:

```sh-session
$ npm install -g @coveo/cli
```

In practice, you'll typically want to [`login`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-authlogin) to your Coveo Organization, [`configure`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-configset) the CLI to connect to this organization, and finally create a search page (see [`coveo ui:create:angular NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreateangular-name), [`coveo ui:create:react NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreatereact-name) and [`coveo ui:create:vue NAME`](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreatevue-name)).

The project is still under heavy development, stay tuned!

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
