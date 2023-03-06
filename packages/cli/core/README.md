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
@coveo/cli/2.3.0 linux-x64 node-v18.14.2
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

- [`coveo auth:login`](#coveo-authlogin)
- [`coveo auth:token`](#coveo-authtoken)
- [`coveo config:get [KEY]`](#coveo-configget-key)
- [`coveo config:set`](#coveo-configset)
- [`coveo help [COMMAND]`](#coveo-help-command)
- [`coveo org:create NAME`](#coveo-orgcreate-name)
- [`coveo org:list`](#coveo-orglist)
- [`coveo org:resources:list`](#coveo-orgresourceslist)
- [`coveo org:resources:model:create`](#coveo-orgresourcesmodelcreate)
- [`coveo org:resources:monitor SNAPSHOTID`](#coveo-orgresourcesmonitor-snapshotid)
- [`coveo org:resources:preview`](#coveo-orgresourcespreview)
- [`coveo org:resources:pull`](#coveo-orgresourcespull)
- [`coveo org:resources:push`](#coveo-orgresourcespush)
- [`coveo org:search:dump`](#coveo-orgsearchdump)
- [`coveo plugins`](#coveo-plugins)
- [`coveo plugins:install PLUGIN...`](#coveo-pluginsinstall-plugin)
- [`coveo plugins:inspect PLUGIN...`](#coveo-pluginsinspect-plugin)
- [`coveo plugins:install PLUGIN...`](#coveo-pluginsinstall-plugin-1)
- [`coveo plugins:link PLUGIN`](#coveo-pluginslink-plugin)
- [`coveo plugins:uninstall PLUGIN...`](#coveo-pluginsuninstall-plugin)
- [`coveo plugins:uninstall PLUGIN...`](#coveo-pluginsuninstall-plugin-1)
- [`coveo plugins:uninstall PLUGIN...`](#coveo-pluginsuninstall-plugin-2)
- [`coveo plugins:update`](#coveo-pluginsupdate)
- [`coveo source:catalog:add SOURCEID`](#coveo-sourcecatalogadd-sourceid)
- [`coveo source:catalog:new NAME`](#coveo-sourcecatalognew-name)
- [`coveo source:list`](#coveo-sourcelist)
- [`coveo source:push:add SOURCEID`](#coveo-sourcepushadd-sourceid)
- [`coveo source:push:delete SOURCEID`](#coveo-sourcepushdelete-sourceid)
- [`coveo source:push:new NAME`](#coveo-sourcepushnew-name)
- [`coveo ui:create:angular NAME`](#coveo-uicreateangular-name)
- [`coveo ui:create:atomic NAME`](#coveo-uicreateatomic-name)
- [`coveo ui:create:react NAME`](#coveo-uicreatereact-name)
- [`coveo ui:create:vue NAME`](#coveo-uicreatevue-name)
- [`coveo ui:deploy`](#coveo-uideploy)
- [`coveo update [CHANNEL]`](#coveo-update-channel)
- [`coveo version`](#coveo-version)

## `coveo auth:login`

Log in to the Coveo Platform using the OAuth2 flow.

```
USAGE
  $ coveo auth:login [-r US|us|EU|eu|AU|au] [-e dev|stg|hipaa|prod] [-o <value>]

FLAGS
  -e, --environment=<option>  [default: prod] The Coveo Platform environment to log in to.
                              <options: dev|stg|hipaa|prod>
  -o, --organization=myOrgID  The identifier of the organization to log in to. If not specified, the CLI logs you in to
                              the first available organization. See also commands `config:get`, `config:set`, and
                              `org:list`.
  -r, --region=<option>       [default: us] The Coveo Platform region to log in to. See
                              <https://docs.coveo.com/en/2976>.
                              <options: US|us|EU|eu|AU|au>

DESCRIPTION
  Log in to the Coveo Platform using the OAuth2 flow.
  Note: TCP port 32111 or 52296 must be available.

EXAMPLES
  $ coveo auth:login
```

_See code: [src/commands/auth/login.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/auth/login.ts)_

## `coveo auth:token`

Log in to the Coveo Platform using an access token.

```
USAGE
  $ coveo auth:token -t <value> [-r US|us|EU|eu|AU|au] [-e dev|stg|hipaa|prod]

FLAGS
  -e, --environment=<option>  [default: prod] The Coveo Platform environment to log in to.
                              <options: dev|stg|hipaa|prod>
  -r, --region=<option>       [default: us] The Coveo Platform region to log in to. See
                              <https://docs.coveo.com/en/2976>.
                              <options: US|us|EU|eu|AU|au>
  -t, --token=xxx-api-key     (required) The API-Key that shall be used to authenticate you to the organization. See
                              <https://github.com/coveo/cli/wiki/Using-the-CLI-using-an-API-Key>.

DESCRIPTION
  Log in to the Coveo Platform using an access token.

EXAMPLES
  $ coveo auth:token
```

_See code: [src/commands/auth/token.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/auth/token.ts)_

## `coveo config:get [KEY]`

Display the current Coveo CLI configuration.

```
USAGE
  $ coveo config:get [KEY]

ARGUMENTS
  KEY  The config key for which to show the value

DESCRIPTION
  Display the current Coveo CLI configuration.

EXAMPLES
  Get all the configuration values

    $ coveo config:get

  Get the organization to which you are connected

    $ coveo config:get organization

  Get the access token given to you by the Coveo Platform

    $ coveo config:get accessToken
```

_See code: [src/commands/config/get.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/config/get.ts)_

## `coveo config:set`

Modify the current Coveo CLI configuration.

```
USAGE
  $ coveo config:set [-o <value>]

FLAGS
  -o, --organization=myOrgID  The identifier of the organization inside which to perform operations. See
                              <https://docs.coveo.com/en/1562/#organization-id-and-other-information>.

DESCRIPTION
  Modify the current Coveo CLI configuration.

EXAMPLES
  connect to a different organization

    $ coveo config:set --organization myOrgId
```

_See code: [src/commands/config/set.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/config/set.ts)_

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

## `coveo org:create NAME`

Create a new test Coveo organization.

```
USAGE
  $ coveo org:create [NAME] [-s]

ARGUMENTS
  NAME  The name to assign to the new organization.

FLAGS
  -s, --[no-]setDefaultOrganization  Set the created organization as the default one

DESCRIPTION
  Create a new test Coveo organization.
```

_See code: [src/commands/org/create.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/create.ts)_

## `coveo org:list`

List Coveo organizations.

```
USAGE
  $ coveo org:list [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  |
    [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -x, --extended     show extra columns
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

DESCRIPTION
  List Coveo organizations.
```

_See code: [src/commands/org/list.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/list.ts)_

## `coveo org:resources:list`

List available Snapshots in an organization

```
USAGE
  $ coveo org:resources:list [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  |
    [--csv | --no-truncate]] [--no-header | ] [-o <value>]

FLAGS
  -o, --organization=targetorganizationg7dg3gd  The unique identifier of the organization containing the snapshots. If
                                                not specified, the organization you are connected to will be used.
  -x, --extended                                show extra columns
  --columns=<value>                             only show provided columns (comma-separated)
  --csv                                         output is csv format [alias: --output=csv]
  --filter=<value>                              filter property by partial string matching, ex: name=foo
  --no-header                                   hide table header from output
  --no-truncate                                 do not truncate output to fit screen
  --output=<option>                             output in a more machine friendly format
                                                <options: csv|json|yaml>
  --sort=<value>                                property to sort by (prepend '-' for descending)

DESCRIPTION
  List available Snapshots in an organization

EXAMPLES
  $ coveo org:resources:list -o=myOrgId
```

_See code: [src/commands/org/resources/list.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/resources/list.ts)_

## `coveo org:resources:model:create`

Create a Snapshot Pull Model

```
USAGE
  $ coveo org:resources:model:create

DESCRIPTION
  Create a Snapshot Pull Model
```

_See code: [src/commands/org/resources/model/create.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/resources/model/create.ts)_

## `coveo org:resources:monitor SNAPSHOTID`

Monitor a Snapshot operation

```
USAGE
  $ coveo org:resources:monitor [SNAPSHOTID] [-w <value>] [-o <value>]

ARGUMENTS
  SNAPSHOTID  The unique identifier of the target snapshot.

FLAGS
  -o, --organization=targetorganizationg7dg3gd  The unique identifier of the organization containing the snapshot. If
                                                not specified, the organization you are connected to will be used.
  -w, --wait=seconds                            [default: 60] The maximum number of seconds to wait before the commands
                                                exits with a timeout error. A value of zero means that the command will
                                                wait indefinitely.

DESCRIPTION
  Monitor a Snapshot operation

EXAMPLES
  Monitor the status of the "mysnapshotid" snapshot in the "myorgid" organization.

    $ coveo org:resources:monitor --organization myorgid --snapshotId mysnapshotid
```

_See code: [src/commands/org/resources/monitor.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/resources/monitor.ts)_

## `coveo org:resources:preview`

Preview the changes that running `coveo org:resources:push` would cause

```
USAGE
  $ coveo org:resources:preview [-w <value>] [-p none|light|detailed] [-o <value>] [-s <value> | ] [-d]

FLAGS
  -d, --showMissingResources                    Preview resources deletion when enabled
  -o, --organization=targetorganizationg7dg3gd  The unique identifier of the organization where to preview the changes
                                                If not specified, the organization you are connected to will be used.
  -p, --previewLevel=(none|light|detailed)      [default: detailed] The verbosity of the preview. The `light` preview is
                                                faster to generate but only contains a limited amount of information, as
                                                opposed to the `detailed` preview that takes more time to generate, but
                                                returns a diff representation of all the changes to apply.
  -s, --snapshotId=<value>                      The unique identifier of the snapshot to pull. If not specified, a new
                                                snapshot will be created. You can list available snapshot in your
                                                organization with org:resources:list
  -w, --wait=seconds                            [default: 60] The maximum number of seconds to wait before the commands
                                                exits with a timeout error. A value of zero means that the command will
                                                wait indefinitely.

DESCRIPTION
  Preview the changes that running `coveo org:resources:push` would cause

EXAMPLES
  $ coveo org:resources:preview

  $ coveo org:resources:preview -o=myOrgId

  $ coveo org:resources:preview -o=myOrgId -d
```

_See code: [src/commands/org/resources/preview.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/resources/preview.ts)_

## `coveo org:resources:pull`

Pull resources from an organization

```
USAGE
  $ coveo org:resources:pull [-w <value>] [-o <value>] [-g] [-f] [-m <value> | [-s <value> | -r
    EXTENSION|FEATURED_RESULT|FIELD|FILTER|MAPPING|QUERY_PARAMETER|QUERY_PIPELINE|QUERY_PIPELINE_CONDITION|RANKING_EXPRE
    SSION|RANKING_WEIGHT|SEARCH_PAGE|SECURITY_PROVIDER|SOURCE|STOP_WORD|SUBSCRIPTION|THESAURUS|TRIGGER] |  | ]

FLAGS
  -f, --overwrite                               Overwrite resources directory if it exists.
  -g, --[no-]git                                Whether to create a git repository when creating a new project.
  -m, --model=path/to/snapshot.json             The path to a snapshot pull model. This flag is useful when you want to
                                                include only specific resource items in your snapshot (e.g., a subset of
                                                sources). Use the "org:resources:model:create" command to create a new
                                                Snapshot Pull Model
  -o, --organization=targetorganizationg7dg3gd  The unique identifier of the organization from which to pull the
                                                resources If not specified, the organization you are connected to will
                                                be used.
  -r, --resourceTypes=type1 type2...            [default:
                                                EXTENSION,FEATURED_RESULT,FIELD,FILTER,MAPPING,QUERY_PARAMETER,QUERY_PIP
                                                ELINE,QUERY_PIPELINE_CONDITION,RANKING_EXPRESSION,RANKING_WEIGHT,SEARCH_
                                                PAGE,SECURITY_PROVIDER,SOURCE,STOP_WORD,SUBSCRIPTION,THESAURUS,TRIGGER]
                                                The resources types to pull from the organization.
  -s, --snapshotId=<value>                      The unique identifier of the snapshot to pull. If not specified, a new
                                                snapshot will be created. You can list available snapshot in your
                                                organization with org:resources:list
  -w, --wait=seconds                            [default: 60] The maximum number of seconds to wait before the commands
                                                exits with a timeout error. A value of zero means that the command will
                                                wait indefinitely.

DESCRIPTION
  Pull resources from an organization

EXAMPLES
  Pull all resources from the organization in which you are authenticated

    $ coveo org:resources:pull

  Pull all resources from the organization whose ID is "myorgid" and do not timeout

    $ coveo org:resources:pull --organization myorgid --wait 0

  Pull only the resources specified in the snapshot pull model

    $ coveo org:resources:pull --model my/snapshot/pull/model.json

  Pull all query pipelines and fields available in the organization

    $ coveo org:resources:pull --resourceTypes QUERY_PIPELINE FIELD,
```

_See code: [src/commands/org/resources/pull.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/resources/pull.ts)_

## `coveo org:resources:push`

Preview, validate and deploy your changes to the destination org

```
USAGE
  $ coveo org:resources:push [-w <value>] [-p none|light|detailed] [-o <value>] [--deleteMissingResources]

FLAGS
  -o, --organization=targetorganizationg7dg3gd  The unique identifier of the organization where to send the changes If
                                                not specified, the organization you are connected to will be used.
  -p, --previewLevel=(none|light|detailed)      [default: detailed] The verbosity of the preview. The `light` preview is
                                                faster to generate but only contains a limited amount of information, as
                                                opposed to the `detailed` preview that takes more time to generate, but
                                                returns a diff representation of all the changes to apply.
  -w, --wait=seconds                            [default: 60] The maximum number of seconds to wait before the commands
                                                exits with a timeout error. A value of zero means that the command will
                                                wait indefinitely.
  --deleteMissingResources                      Delete missing resources when enabled

DESCRIPTION
  Preview, validate and deploy your changes to the destination org

EXAMPLES
  Preview, validate and deploy resources to the organization in which you are authenticated

    $ coveo org:resources:push

  Preview, validate and deploy resources to the organization whose ID is "myorgid"

    $ coveo org:resources:push --organization myorgid

  Validate and deploy resources without displaying a preview

    $ coveo org:resources:push --previewLevel none

  Preview, validate and deploy resources, but also delete from the organization all the resources that are not
  available inside the "resources/" directory

    $ coveo org:resources:push --deleteMissingResources
```

_See code: [src/commands/org/resources/push.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/resources/push.ts)_

## `coveo org:search:dump`

Dump the content of one or more sources in CSV format.

```
USAGE
  $ coveo org:search:dump -s <value> [-p <value>] [-x <value>] [-d <value>] [-n <value>] [-f <value>] [-c <value>]

FLAGS
  -c, --chunkSize=<value>           [default: 10000] The maximum number of results to dump into each CSV file.
  -d, --destination=<value>         [default: .] The folder in which to create the CSV files. The data dump will fail if
                                    the folder doesn't exist.
  -f, --additionalFilter=<value>    The additional search filter to apply while getting the content. See
                                    <https://docs.coveo.com/en/1552>.
  -n, --name=<value>                [default: indexdump] The base name to use when creating a new CSV file. If more than
                                    one file is created, the CLI will append `_2`, `_3`, etc. to each new file name
                                    after the first one.
  -p, --pipeline=<value>            The name of the query pipeline through which to get content. If not specified, the
                                    default query pipeline is used. See <https://docs.coveo.com/en/180>
  -s, --source=mySourceName...      (required) The names (not the identifiers) of the sources from which to get content.
  -x, --fieldsToExclude=<value>...  The fields to exclude from the data dump. If not specified, all fields are included.

DESCRIPTION
  Dump the content of one or more sources in CSV format.

  Note: DictionnaryFields/Values are experimentally supported. In case of failure, you should exclude them using the
  `-x` flag.

EXAMPLES
  Get content indexed into the "My Web Source" and "My Sitemap Source" sources.

    $ coveo org:search:dump --source "My Web Source" "My Sitemap Source"

  Get all the products coming from the "Search" pipeline that are either in the "Shorts" or "Jackets" category.

    $ coveo org:search:dump --source Products --pipeline Search --additionalFilter "@cat_categories==(Shorts, \
      Jackets)"

  Get all the products coming from the "Search" pipeline that are in the "Shorts" category and have the color "Black".

    $ coveo org:search:dump --source Products --pipeline Search --additionalFilter "@cat_categories==Shorts AND \
      @color==Black"

  Get all the documents without the fields "ec_description" and "ec_summary" in them.

    $ coveo org:search:dump --fieldsToExclude ec_description ec_summary
```

_See code: [src/commands/org/search/dump.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/org/search/dump.ts)_

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

## `coveo source:catalog:add SOURCEID`

Index a JSON document into a Coveo Catalog source. See https://docs.coveo.com/en/2956 for more information.

```
USAGE
  $ coveo source:catalog:add [SOURCEID] [-f <value>] [-c <value> | ] [-m] [-n] [--fullUpload] [--skipFullUploadCheck]

ARGUMENTS
  SOURCEID  The identifier of the Catalog source on which to perform the add operation. See `source:list` to obtain the
            identifier.

FLAGS
  -c, --maxConcurrent=<value>
      [default: 10] The maximum number of requests to send concurrently. Increasing this value increases the speed at
      which documents are indexed to the Coveo platform. However, if you run into memory or throttling issues, consider
      reducing this value.

  -f, --files=myfile.json...
      Combinaison of JSON files and folders (containing JSON files) to push. Can be repeated.

  -m, --[no-]createMissingFields
      Analyse documents to detect and automatically create missing fields in the destination organization. When enabled,
      an error will be thrown if a field is used to store data of inconsistent type across documents.

  -n, --[no-]normalizeInvalidFields
      Whether to normalize invalid fields detected from the documents. If set to `false`, an error will be thrown when
      invalid fields are detected.

  --fullUpload
      Controls the way your items are added to your catalog source.

      Setting this option to false will trigger a document update (Default operation). Useful to perform incremental
      updates for smaller adjustments to your catalog that do not require pushing the entire catalog. A document update
      must only be performed after a full catalog upload.
      See https://docs.coveo.com/en/l62e0540

      Setting this option to true will trigger a full catalog upload. This process acts as a full rebuild of your catalog
      source. Therefore, previous items that are not included in the new payload will be deleted.
      See https://docs.coveo.com/en/lb4a0344

  --skipFullUploadCheck
      Do not check whether a full catalog upload was triggered on the target source.

DESCRIPTION
  Index a JSON document into a Coveo Catalog source. See https://docs.coveo.com/en/2956 for more information.
```

_See code: [@coveo/cli-plugin-source](https://github.com/coveo/cli/blob/@coveo/cli@2.0.5/packages/cli/source/src/commands/source/catalog/add.ts)_

## `coveo source:catalog:new NAME`

Create a new catalog source in a Coveo organization

```
USAGE
  $ coveo source:catalog:new [NAME] [-v PRIVATE|SECURED|SHARED]

ARGUMENTS
  NAME  The name of the source to create.

FLAGS
  -v, --sourceVisibility=(PRIVATE|SECURED|SHARED)  [default: SECURED] Controls the content security option that should
                                                   be applied to the items in a source. See
                                                   https://docs.coveo.com/en/1779/index-content/content-security

DESCRIPTION
  Create a new catalog source in a Coveo organization
```

_See code: [@coveo/cli-plugin-source](https://github.com/coveo/cli/blob/@coveo/cli@2.0.5/packages/cli/source/src/commands/source/catalog/new.ts)_

## `coveo source:list`

List all available push sources in your Coveo organization

```
USAGE
  $ coveo source:list [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  |
    [--csv | --no-truncate]] [--no-header | ]

FLAGS
  -x, --extended     show extra columns
  --columns=<value>  only show provided columns (comma-separated)
  --csv              output is csv format [alias: --output=csv]
  --filter=<value>   filter property by partial string matching, ex: name=foo
  --no-header        hide table header from output
  --no-truncate      do not truncate output to fit screen
  --output=<option>  output in a more machine friendly format
                     <options: csv|json|yaml>
  --sort=<value>     property to sort by (prepend '-' for descending)

DESCRIPTION
  List all available push sources in your Coveo organization
```

_See code: [@coveo/cli-plugin-source](https://github.com/coveo/cli/blob/@coveo/cli@2.0.5/packages/cli/source/src/commands/source/list.ts)_

## `coveo source:push:add SOURCEID`

Index a JSON document into a Coveo Push source. See https://github.com/coveo/cli/wiki/Pushing-JSON-Files-with-the-Coveo-CLI for more information.

```
USAGE
  $ coveo source:push:add [SOURCEID] [-f <value>] [-c <value> | ] [-m] [-n]

ARGUMENTS
  SOURCEID  The identifier of the source on which to perform the add operation. See source:list to obtain the
            identifier.

FLAGS
  -c, --maxConcurrent=<value>        [default: 10] The maximum number of requests to send concurrently. Increasing this
                                     value increases the speed at which documents are indexed to the Coveo platform.
                                     However, if you run into memory or throttling issues, consider reducing this value.
  -f, --files=myfile.json...         Combinaison of JSON files and folders (containing JSON files) to push. Can be
                                     repeated.
  -m, --[no-]createMissingFields     Analyse documents to detect and automatically create missing fields in the
                                     destination organization. When enabled, an error will be thrown if a field is used
                                     to store data of inconsistent type across documents.
  -n, --[no-]normalizeInvalidFields  Whether to normalize invalid fields detected from the documents. If set to `false`,
                                     an error will be thrown when invalid fields are detected.

DESCRIPTION
  Index a JSON document into a Coveo Push source. See
  https://github.com/coveo/cli/wiki/Pushing-JSON-Files-with-the-Coveo-CLI for more information.
```

_See code: [@coveo/cli-plugin-source](https://github.com/coveo/cli/blob/@coveo/cli@2.0.5/packages/cli/source/src/commands/source/push/add.ts)_

## `coveo source:push:delete SOURCEID`

Delete one or multiple items in a given Push source. See <https://docs.coveo.com/en/171> and <https://docs.coveo.com/en/131>

```
USAGE
  $ coveo source:push:delete [SOURCEID] [-d <value> | -x <value>] [-c]

ARGUMENTS
  SOURCEID  The identifier of the Push source on which to perform the delete operation. To retrieve the list of
            available Push source identifiers, use the `source:push:list` command.

FLAGS
  -c, --[no-]deleteChildren
      Whether to delete all items that share the same base URI as the specified item to delete.

  -d, --deleteOlderThan=2000-01-01T00:00:00-06:00 OR 1506700606240
      If this flag is set, all items that have been added or updated in the source before the specified ISO 8601 date or
      Unix timestamp in milliseconds will be deleted. The documents will be deleted using the default queueDelay, meaning
      they will stay in the index for about 15 minutes after being marked for deletion.

  -x, --delete=<value>...
      The URIs of the items to delete. Can be repeated. If you want to delete more than one specific items, use the
      `--deleteOlderThan` flag instead.

DESCRIPTION
  Delete one or multiple items in a given Push source. See <https://docs.coveo.com/en/171> and
  <https://docs.coveo.com/en/131>
```

_See code: [@coveo/cli-plugin-source](https://github.com/coveo/cli/blob/@coveo/cli@2.0.5/packages/cli/source/src/commands/source/push/delete.ts)_

## `coveo source:push:new NAME`

Create a new push source in a Coveo organization

```
USAGE
  $ coveo source:push:new [NAME] [-v PRIVATE|SECURED|SHARED]

ARGUMENTS
  NAME  The name of the source to create.

FLAGS
  -v, --sourceVisibility=(PRIVATE|SECURED|SHARED)  [default: SECURED] Controls the content security option that should
                                                   be applied to the items in a source. See
                                                   https://docs.coveo.com/en/1779/index-content/content-security

DESCRIPTION
  Create a new push source in a Coveo organization
```

_See code: [@coveo/cli-plugin-source](https://github.com/coveo/cli/blob/@coveo/cli@2.0.5/packages/cli/source/src/commands/source/push/new.ts)_

## `coveo ui:create:angular NAME`

Create a Coveo Headless-powered search page with the Angular web framework. See <https://docs.coveo.com/headless> and <https://angular.io/>.

```
USAGE
  $ coveo ui:create:angular [NAME] [-v <value>] [-d]

ARGUMENTS
  NAME  The name of the application to create.

FLAGS
  -d, --defaults         Whether to automatically select the default value for all prompts that have a default value.
  -v, --version=<value>  [default: 1.35.23] The version of @coveo/angular to use.

DESCRIPTION
  Create a Coveo Headless-powered search page with the Angular web framework. See <https://docs.coveo.com/headless> and
  <https://angular.io/>.
```

_See code: [src/commands/ui/create/angular.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/ui/create/angular.ts)_

## `coveo ui:create:atomic NAME`

Create a Coveo Headless-powered search page with Coveo's own Atomic framework. See <https://docs.coveo.com/atomic> and <https://docs.coveo.com/headless>.

```
USAGE
  $ coveo ui:create:atomic [NAME] [-v <value>] [-p <value>]

ARGUMENTS
  NAME  The name of the application to create.

FLAGS
  -p, --pageId=7944ff4a-9943-4999-a3f6-3e81a7f6fb0a  The hosted search page ID.
  -v, --version=<value>                              [default: 1.36.4] The version of @coveo/create-atomic to use.

DESCRIPTION
  Create a Coveo Headless-powered search page with Coveo's own Atomic framework. See <https://docs.coveo.com/atomic> and
  <https://docs.coveo.com/headless>.

EXAMPLES
  $ coveo ui:create:atomic myapp
```

_See code: [src/commands/ui/create/atomic.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/ui/create/atomic.ts)_

## `coveo ui:create:react NAME`

Create a Coveo Headless-powered search page with the React web framework. See <https://docs.coveo.com/headless> and <https://reactjs.org/>.

```
USAGE
  $ coveo ui:create:react [NAME] [-v <value>]

ARGUMENTS
  NAME  The name of the application to create.

FLAGS
  -v, --version=<value>  [default: 1.36.5] Version of @coveo/cra-template to use.

DESCRIPTION
  Create a Coveo Headless-powered search page with the React web framework. See <https://docs.coveo.com/headless> and
  <https://reactjs.org/>.

EXAMPLES
  $ coveo ui:create:react myapp

  $ coveo ui:create:react --help
```

_See code: [src/commands/ui/create/react.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/ui/create/react.ts)_

## `coveo ui:create:vue NAME`

Create a Coveo Headless-powered search page with the Vue3 and Vite. See <https://docs.coveo.com/headless> and <https://vuejs.org/>.

```
USAGE
  $ coveo ui:create:vue [NAME] [-v <value>]

ARGUMENTS
  NAME  The name of the application to create.

FLAGS
  -v, --version=<value>  [default: 1.1.0] The version of @coveo/create-headless-vue to use.

DESCRIPTION
  Create a Coveo Headless-powered search page with the Vue3 and Vite. See <https://docs.coveo.com/headless> and
  <https://vuejs.org/>.

EXAMPLES
  $ coveo ui:create:vue myVueProject

  $ coveo ui:create:vue-v=1.2.3 myVueProject
```

_See code: [src/commands/ui/create/vue.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/ui/create/vue.ts)_

## `coveo ui:deploy`

Deploy your search application to the Coveo infrastructure.

```
USAGE
  $ coveo ui:deploy [-p <value>] [-c <value>] [-o <value>]

FLAGS
  -c, --config=coveo.deploy.json                     [default: coveo.deploy.json] The path to the deployment JSON
                                                     configuration.
  -o, --organization=targetorganizationg7dg3gd       The unique identifier of the organization where to deploy the
                                                     hosted page. If not specified, the organization you are connected
                                                     to will be used.
  -p, --pageId=7944ff4a-9943-4999-a3f6-3e81a7f6fb0a  The existing ID of the target Hosted search page.

DESCRIPTION
  Deploy your search application to the Coveo infrastructure.
  The target `config` if present, must contain the following parameters:
  {
    "name": "The name of the hosted search page.",
    "dir": "The directory of the hosted search page.",
    "htmlEntryFile": {
      "path": "The path to an HTML file containing the HTML markup of the hosted page."
    },
    "javascriptEntryFiles": [
      {
        "path": "The path to a bundled Javascript file.",
        "isModule": "Whether the inline code should be treated as a JavaScript module. If this property is true, the type property will be set to `module` on the script tag."
      }
    ],
    "javascriptUrls": [
      {
        "path": "The URL of the JavaScript source file.",
        "isModule": "Whether the inline code should be treated as a JavaScript module. If this property is true, the type property will be set to `module` on the script tag."
      }
    ],
    "cssEntryFiles": [
      {
        "path": "The path to a bundled CSS file."
      }
    ],
    "cssUrls": [
      {
        "path": "The URL of the CSS stylesheet."
      }
    ]
  }

EXAMPLES
  Create a new Hosted Page according to the configuration in the file "coveo.deploy.json"

    $ coveo ui:deploy

  Update the Hosted Page whose ID is "7944ff4a-9943-4999-a3f6-3e81a7f6fb0a" according to the configuration in the file
  "coveo.deploy.json"

    $ coveo ui:deploy -p 7944ff4a-9943-4999-a3f6-3e81a7f6fb0a

  Create a new Hosted Page according to the configuration in the file located at "./configs/myconfig.json"

    $ coveo ui:deploy -c ./configs/myconfig.json
```

_See code: [src/commands/ui/deploy.ts](https://github.com/coveo/cli/blob/@coveo/cli@2.3.0/packages/cli/core/src/commands/ui/deploy.ts)_

## `coveo update [CHANNEL]`

update the coveo CLI

```
USAGE
  $ coveo update [CHANNEL] [-a] [-v <value> | -i] [--force]

FLAGS
  -a, --available        Install a specific version.
  -i, --interactive      Interactively select version to install. This is ignored if a channel is provided.
  -v, --version=<value>  Install a specific version.
  --force                Force a re-download of the requested version.

DESCRIPTION
  update the coveo CLI

EXAMPLES
  Update to the stable channel:

    $ coveo update stable

  Update to a specific version:

    $ coveo update --version 1.0.0

  Interactively select version:

    $ coveo update --interactive

  See available versions:

    $ coveo update --available
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v3.0.12/src/commands/update.ts)_

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
