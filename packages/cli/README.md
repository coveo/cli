# @coveo/cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![Codecov](https://codecov.io/gh/coveo/cli/branch/master/graph/badge.svg)](https://codecov.io/gh/coveo/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![License](https://img.shields.io/npm/l/@coveo/cli.svg)](https://github.com/coveo/cli/blob/master/package.json)

<!-- toc -->
* [@coveo/cli](#coveocli)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @coveo/cli
$ coveo COMMAND
running command...
$ coveo (-v|--version|version)
@coveo/cli/1.0.0 linux-x64 node-v14.16.1
$ coveo --help [COMMAND]
USAGE
  $ coveo COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`coveo auth:login`](#coveo-authlogin)
* [`coveo config:get`](#coveo-configget)
* [`coveo config:set`](#coveo-configset)
* [`coveo help [COMMAND]`](#coveo-help-command)
* [`coveo org:list`](#coveo-orglist)
* [`coveo ui:create:angular NAME`](#coveo-uicreateangular-name)
* [`coveo ui:create:react NAME`](#coveo-uicreatereact-name)
* [`coveo ui:create:vue NAME`](#coveo-uicreatevue-name)
* [`coveo update [CHANNEL]`](#coveo-update-channel)

## `coveo auth:login`

Log into the Coveo platform using the OAuth2 flow.

```
USAGE
  $ coveo auth:login

OPTIONS
  -e, --environment=dev|qa|prod|hipaa                                  [default: prod] The Coveo platform environment to
                                                                       log into.

  -o, --organization=myOrgID                                           The identifier of the organization to log into.
                                                                       If not specified, the CLI logs you in the first
                                                                       organization available. See also commands
                                                                       config:get, config:set, and org:list.

  -r, --region=us-east-1|eu-west-1|eu-west-3|ap-southeast-2|us-west-2  [default: us-east-1] The platform region to log
                                                                       into. See https://docs.coveo.com/en/2976.

EXAMPLE
  $ coveo auth:login
```

_See code: [src/commands/auth/login.ts](https://github.com/coveo/cli/blob/v1.0.0/src/commands/auth/login.ts)_

## `coveo config:get`

Display the current configuration.

```
USAGE
  $ coveo config:get
```

_See code: [src/commands/config/get.ts](https://github.com/coveo/cli/blob/v1.0.0/src/commands/config/get.ts)_

## `coveo config:set`

Modify the current configuration.

```
USAGE
  $ coveo config:set

OPTIONS
  -a, --analytics=y|n                                                  Wether to enable analytics and telemetry
                                                                       tracking.

  -e, --environment=dev|qa|prod|hipaa                                  The platform environment inside which to perform
                                                                       operations.

  -o, --organization=myOrgID                                           The identifier of the organization inside which
                                                                       to perform operations. See
                                                                       https://docs.coveo.com/en/1562/#organization-id-a
                                                                       nd-other-information.

  -r, --region=us-east-1|eu-west-1|eu-west-3|ap-southeast-2|us-west-2  The platform region inside which to perform
                                                                       operations. See https://docs.coveo.com/en/2976.
```

_See code: [src/commands/config/set.ts](https://github.com/coveo/cli/blob/v1.0.0/src/commands/config/set.ts)_

## `coveo help [COMMAND]`

display help for coveo

```
USAGE
  $ coveo help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `coveo org:list`

List Coveo organizations.

```
USAGE
  $ coveo org:list

OPTIONS
  -x, --extended          show extra columns
  --columns=columns       only show provided columns (comma-separated)
  --csv                   output is csv format [alias: --output=csv]
  --filter=filter         filter property by partial string matching, ex: name=foo
  --no-header             hide table header from output
  --no-truncate           do not truncate output to fit screen
  --output=csv|json|yaml  output in a more machine friendly format
  --sort=sort             property to sort by (prepend '-' for descending)
```

_See code: [src/commands/org/list.ts](https://github.com/coveo/cli/blob/v1.0.0/src/commands/org/list.ts)_

## `coveo ui:create:angular NAME`

Create a Coveo Headless-powered search page with the Angular web framework. See https://docs.coveo.com/headless and https://angular.io/.

```
USAGE
  $ coveo ui:create:angular NAME

ARGUMENTS
  NAME  The target application name.

OPTIONS
  -d, --defaults         Automatically select the default value for all prompts where such a default value exists.
  -v, --version=version  [default: 1.0.0] Version of @coveo/angular to use.
```

_See code: [src/commands/ui/create/angular.ts](https://github.com/coveo/cli/blob/v1.0.0/src/commands/ui/create/angular.ts)_

## `coveo ui:create:react NAME`

Create a Coveo Headless-powered search page with the React web framework. See https://docs.coveo.com/headless and https://reactjs.org/.

```
USAGE
  $ coveo ui:create:react NAME

ARGUMENTS
  NAME  The target application name.

OPTIONS
  -v, --version=version  [default: 1.0.0] Version of @coveo/cra-template to use.

EXAMPLES
  $ coveo ui:create:react myapp
  $ coveo ui:create:react --help
```

_See code: [src/commands/ui/create/react.ts](https://github.com/coveo/cli/blob/v1.0.0/src/commands/ui/create/react.ts)_

## `coveo ui:create:vue NAME`

Create a Coveo Headless-powered search page with the Vue.js web framework. See https://docs.coveo.com/headless and https://vuejs.org/

```
USAGE
  $ coveo ui:create:vue NAME

ARGUMENTS
  NAME  The target application name.

OPTIONS
  -h, --help             show CLI help

  -p, --preset=path      Path to a JSON file with pre-defined options and plugins for creating a new project.
                         If not specified, the default TypeScript preset is used.
                         For more information about Vue CLI presets, please consult
                         https://cli.vuejs.org/guide/plugins-and-presets.html#presets

  -v, --version=version  [default: 1.0.0] Version of @coveo/vue-cli-plugin-typescript to use.

EXAMPLES
  $ coveo ui:create:vue --preset path/to/my/preset.json
  $ coveo ui:create:vue --help
```

_See code: [src/commands/ui/create/vue.ts](https://github.com/coveo/cli/blob/v1.0.0/src/commands/ui/create/vue.ts)_

## `coveo update [CHANNEL]`

update the coveo CLI

```
USAGE
  $ coveo update [CHANNEL]
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.3.10/src/commands/update.ts)_
<!-- commandsstop -->

```

```
