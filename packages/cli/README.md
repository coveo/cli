# @coveo/cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![Codecov](https://codecov.io/gh/coveo/cli/branch/master/graph/badge.svg)](https://codecov.io/gh/coveo/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![License](https://img.shields.io/npm/l/@coveo/cli.svg)](https://github.com/coveo/cli/blob/master/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @coveo/cli
$ coveo COMMAND
running command...
$ coveo (-v|--version|version)
@coveo/cli/0.0.0 darwin-x64 node-v12.16.0
$ coveo --help [COMMAND]
USAGE
  $ coveo COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`coveo auth:login`](#coveo-authlogin)
- [`coveo config:get`](#coveo-configget)
- [`coveo config:set [FILE]`](#coveo-configset-file)
- [`coveo hello [FILE]`](#coveo-hello-file)
- [`coveo help [COMMAND]`](#coveo-help-command)
- [`coveo ui:create:vue [NAME]`](#coveo-uicreatevue-name)
- [`coveo ui:create:react [NAME]`](#coveo-uicreatereact-name)
- [`coveo org:list [FILE]`](#coveo-orglist-file)
- [`coveo ui:create:vue NAME`](#coveo-uicreatevue-name)

## `coveo auth:login`

Log into Coveo platform using OAuth2 flow

```
USAGE
  $ coveo auth:login

OPTIONS
  -e, --environment=dev|qa|prod|hipaa                                  [default: prod] The platform environment inside
                                                                       which to login.

  -o, --organization=myOrgID                                           The organization inside which to login. If not
                                                                       specified, the first organization available will
                                                                       be picked. See also commands config:get,
                                                                       config:set, and org:list

  -r, --region=us-east-1|eu-west-1|eu-west-3|ap-southeast-2|us-west-2  [default: us-east-1] The platform region inside
                                                                       which to login. See
                                                                       https://docs.coveo.com/en/2976

EXAMPLE
  $ coveo auth:login
```

_See code: [src/commands/auth/login.ts](https://github.com/coveo/cli/blob/v0.0.0/src/commands/auth/login.ts)_

## `coveo config:get`

display the current configuration

```
USAGE
  $ coveo config:get
```

_See code: [src/commands/config/get.ts](https://github.com/coveo/cli/blob/v0.0.0/src/commands/config/get.ts)_

## `coveo config:set [FILE]`

describe the command here

```
USAGE
  $ coveo config:set [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/config/set.ts](https://github.com/coveo/cli/blob/v0.0.0/src/commands/config/set.ts)_

## `coveo hello [FILE]`

describe the command here

```
USAGE
  $ coveo hello [FILE]

ARGUMENTS
  FILE  a dummy file

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ coveo hello
       hello world from ./src/hello.ts!
```

_See code: [src/commands/hello.ts](https://github.com/coveo/cli/blob/v0.0.0/src/commands/hello.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.1/src/commands/help.ts)_

## `coveo ui:create:vue NAME`

Create a new project powered by vue-cli-service

```
USAGE
  $ coveo ui:create:vue NAME
ARGUMENTS
  NAME  application name
OPTIONS
  -h, --help         show CLI help
  -p, --preset=path  [default: /Users/olamothe/cli/packages/cli/src/commands/ui/create/presets/typescript-preset.json]
                     Path to a JSON file with pre-defined options and plugins for creating a new project.
                     If not specified, the default TypeScript preset will be taked
                     For more information about Vue CLI presets, please consult
                     https://cli.vuejs.org/guide/plugins-and-presets.html#presets
EXAMPLES
  $ coveo ui:create:vue --preset path/to/my/preset.json
  $ coveo ui:create:vue --help
```

_See code: [src/commands/ui/create/vue.ts](https://github.com/coveo/cli/blob/v0.0.0/src/commands/ui/create/vue.ts)_

## `coveo ui:create:react [NAME]`

Create a search page in React powered by Coveo Headless

```
USAGE
  $ coveo ui:create:react [NAME]

OPTIONS
  -h, --help       show CLI help
## `coveo org:list [FILE]`

test command for oauth + config that list orgs

```

USAGE
$ coveo org:list [FILE]

OPTIONS
-x, --extended show extra columns
--columns=columns only show provided columns (comma-separated)
--csv output is csv format [alias: --output=csv]
--filter=filter filter property by partial string matching, ex: name=foo
--no-header hide table header from output
--no-truncate do not truncate output to fit screen
--output=csv|json|yaml output in a more machine friendly format
--sort=sort property to sort by (prepend '-' for descending)

```

_See code: [src/commands/org/list.ts](https://github.com/coveo/cli/blob/v0.0.0/src/commands/org/list.ts)_

## `coveo ui:create:vue NAME`

Create a new project powered by vue-cli-service

```

USAGE
$ coveo ui:create:vue NAME

ARGUMENTS
NAME application name

OPTIONS
-h, --help show CLI help

-p, --preset=path [default: /Users/olamothe/cli/packages/cli/src/commands/ui/create/presets/typescript-preset.json]
Path to a JSON file with pre-defined options and plugins for creating a new project.
If not specified, the default TypeScript preset will be taked
For more information about Vue CLI presets, please consult
https://cli.vuejs.org/guide/plugins-and-presets.html#presets

EXAMPLES
$ coveo ui:create:vue --preset path/to/my/preset.json
$ coveo ui:create:vue --help

```

_See code: [src/commands/ui/create/react.ts](https://github.com/coveo/cli/blob/v0.0.0/src/commands/ui/create/react.ts)_
<!-- commandsstop -->
```
