# @coveo/cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![Codecov](https://codecov.io/gh/coveo/cli/branch/master/graph/badge.svg)](https://codecov.io/gh/coveo/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![License](https://img.shields.io/npm/l/@coveo/cli.svg)](https://github.com/coveo/cli/blob/master/package.json)

<!-- toc -->

- [@coveo/cli](#coveocli)
- [Usage](#usage)
- [Configuration](#configuration)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @coveo/cli
$ coveo COMMAND
running command...
$ coveo (--version)
@coveo/cli/3.2.10 linux-x64 node-v20.12.2
$ coveo --help [COMMAND]
USAGE
  $ coveo COMMAND
...
```

<!-- usagestop -->

# Configuration

The Coveo CLI is based on oclif and uses the following paths:

- **cacheDir** - CLI cache directory
  - macOS: `~/Library/Caches/@coveo/cli`
  - Unix: `~/.cache/@coveo/cli`
  - Windows: `%LOCALAPPDATA%\@coveo\cli`
  - Can be overridden with `XDG_CACHE_HOME`
- **configDir** - CLI config directory
  - Unix: `~/.config/@coveo/cli`
  - Windows: `%LOCALAPPDATA%\@coveo\cli`
  - Can be overridden with `XDG_CONFIG_HOME`
- **dataDir** - CLI data directory
  - Unix: `~/.data/@coveo/cli`
  - Windows: `%LOCALAPPDATA%\@coveo\cli`
  - Can be overridden with `XDG_DATA_HOME`

The Coveo CLI may not function if you do not have read and write access to those directories.

The main config file of the Coveo CLI is stored in a JSON file in `configDir`.

# Commands

<!-- commands -->

- [`coveo help [COMMAND]`](#coveo-help-command)
- [`coveo plugins`](#coveo-plugins)
- [`coveo plugins:install PLUGIN...`](#coveo-pluginsinstall-plugin)
- [`coveo plugins:inspect PLUGIN...`](#coveo-pluginsinspect-plugin)
- [`coveo plugins:install PLUGIN...`](#coveo-pluginsinstall-plugin-1)
- [`coveo plugins:link PLUGIN`](#coveo-pluginslink-plugin)
- [`coveo plugins:uninstall PLUGIN...`](#coveo-pluginsuninstall-plugin)
- [`coveo plugins:uninstall PLUGIN...`](#coveo-pluginsuninstall-plugin-1)
- [`coveo plugins:uninstall PLUGIN...`](#coveo-pluginsuninstall-plugin-2)
- [`coveo plugins:update`](#coveo-pluginsupdate)
- [`coveo version`](#coveo-version)

## `coveo help [COMMAND]`

Display help for coveo.

```
USAGE
  $ coveo help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for coveo.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.23/src/commands/help.ts)_

## `coveo plugins`

List installed plugins.

```
USAGE
  $ coveo plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ coveo plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.12/src/commands/plugins/index.ts)_

## `coveo plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ coveo plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ coveo plugins:add

EXAMPLES
  $ coveo plugins:install myplugin

  $ coveo plugins:install https://github.com/someuser/someplugin

  $ coveo plugins:install someuser/someplugin
```

## `coveo plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ coveo plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ coveo plugins:inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.12/src/commands/plugins/inspect.ts)_

## `coveo plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ coveo plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.
  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.


ALIASES
  $ coveo plugins:add

EXAMPLES
  $ coveo plugins:install myplugin

  $ coveo plugins:install https://github.com/someuser/someplugin

  $ coveo plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.12/src/commands/plugins/install.ts)_

## `coveo plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ coveo plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ coveo plugins:link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.12/src/commands/plugins/link.ts)_

## `coveo plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ coveo plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ coveo plugins:unlink
  $ coveo plugins:remove
```

## `coveo plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ coveo plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ coveo plugins:unlink
  $ coveo plugins:remove
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.12/src/commands/plugins/uninstall.ts)_

## `coveo plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ coveo plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ coveo plugins:unlink
  $ coveo plugins:remove
```

## `coveo plugins:update`

Update installed plugins.

```
USAGE
  $ coveo plugins:update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.12/src/commands/plugins/update.ts)_

## `coveo version`

```
USAGE
  $ coveo version [--json] [--verbose]

FLAGS
  --verbose  Show additional information about the CLI.

GLOBAL FLAGS
  --json  Format output as json.

FLAG DESCRIPTIONS
  --verbose  Show additional information about the CLI.

    Additionally shows the architecture, node version, operating system, and versions of plugins that the CLI is using.
```

_See code: [@oclif/plugin-version](https://github.com/oclif/plugin-version/blob/v1.1.4/src/commands/version.ts)_

<!-- commandsstop -->
