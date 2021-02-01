@coveo/cli
==========



[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![Codecov](https://codecov.io/gh/coveo/cli/branch/master/graph/badge.svg)](https://codecov.io/gh/coveo/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![License](https://img.shields.io/npm/l/@coveo/cli.svg)](https://github.com/coveo/cli/blob/master/package.json)

<!-- toc -->
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
@coveo/cli/0.0.0 darwin-x64 node-v14.15.4
$ coveo --help [COMMAND]
USAGE
  $ coveo COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`coveo hello [FILE]`](#coveo-hello-file)
* [`coveo help [COMMAND]`](#coveo-help-command)
* [`coveo ui:create:vue [FILE]`](#coveo-uicreatevue-file)

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

## `coveo ui:create:vue [FILE]`

describe the command here

```
USAGE
  $ coveo ui:create:vue [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/ui/create/vue.ts](https://github.com/coveo/cli/blob/v0.0.0/src/commands/ui/create/vue.ts)_
<!-- commandsstop -->
