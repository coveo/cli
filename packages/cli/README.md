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
@coveo/cli/1.19.0 linux-x64 node-v16.13.0
$ coveo --help [COMMAND]
USAGE
  $ coveo COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`coveo auth:login`](#coveo-authlogin)
* [`coveo auth:token`](#coveo-authtoken)
* [`coveo config:get`](#coveo-configget)
* [`coveo config:set`](#coveo-configset)
* [`coveo help [COMMAND]`](#coveo-help-command)
* [`coveo org:create NAME`](#coveo-orgcreate-name)
* [`coveo org:list`](#coveo-orglist)
* [`coveo org:search:dump`](#coveo-orgsearchdump)
* [`coveo source:push:add SOURCEID`](#coveo-sourcepushadd-sourceid)
* [`coveo source:push:delete SOURCEID`](#coveo-sourcepushdelete-sourceid)
* [`coveo source:push:list`](#coveo-sourcepushlist)
* [`coveo source:push:new NAME`](#coveo-sourcepushnew-name)
* [`coveo ui:create:angular NAME`](#coveo-uicreateangular-name)
* [`coveo ui:create:react NAME`](#coveo-uicreatereact-name)
* [`coveo ui:create:vue NAME`](#coveo-uicreatevue-name)
* [`coveo update [CHANNEL]`](#coveo-update-channel)

## `coveo auth:login`

Log in to the Coveo Platform using the OAuth2 flow.

```
USAGE
  $ coveo auth:login

OPTIONS
  -e, --environment=dev|qa|hipaa|prod  [default: prod] The Coveo Platform environment to log in to.

  -o, --organization=myOrgID           The identifier of the organization to log in to. If not specified, the CLI logs
                                       you in to the first available organization. See also commands `config:get`,
                                       `config:set`, and `org:list`.

  -r, --region=US|EU|AU                [default: us] The Coveo Platform region to log in to. See
                                       <https://docs.coveo.com/en/2976>.

EXAMPLE
  $ coveo auth:login
```

_See code: [src/commands/auth/login.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/auth/login.ts)_

## `coveo auth:token`

Log in to the Coveo Platform using the OAuth2 flow.

```
USAGE
  $ coveo auth:token

OPTIONS
  -e, --environment=dev|qa|hipaa|prod  [default: prod] The Coveo Platform environment to log in to.

  -r, --region=US|EU|AU                [default: us] The Coveo Platform region to log in to. See
                                       <https://docs.coveo.com/en/2976>.

  -t, --token=xxx-api-key              (required) The API-Key that shall be used to authenticate you to the
                                       organization. See
                                       <https://github.com/coveo/cli/wiki/Using-the-CLI-using-an-API-Key>.

EXAMPLE
  $ coveo auth:token
```

_See code: [src/commands/auth/token.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/auth/token.ts)_

## `coveo config:get`

Display the current configuration.

```
USAGE
  $ coveo config:get
```

_See code: [src/commands/config/get.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/config/get.ts)_

## `coveo config:set`

Modify the current configuration.

```
USAGE
  $ coveo config:set

OPTIONS
  -a, --analytics=y|n                  Whether to enable analytics and telemetry tracking.
  -e, --environment=dev|qa|hipaa|prod  The Coveo Platform environment to log in to.

  -o, --organization=myOrgID           The identifier of the organization inside which to perform operations. See
                                       <https://docs.coveo.com/en/1562/#organization-id-and-other-information>.

  -r, --region=US|EU|AU                The Coveo Platform region to log in to. See <https://docs.coveo.com/en/2976>.
```

_See code: [src/commands/config/set.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/config/set.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.4/src/commands/help.ts)_

## `coveo org:create NAME`

Create a new test Coveo organization.

```
USAGE
  $ coveo org:create NAME

ARGUMENTS
  NAME  The name to assign to the new organization.

OPTIONS
  -s, --[no-]setDefaultOrganization  Set the created organization as the default one
```

_See code: [src/commands/org/create.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/org/create.ts)_

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

_See code: [src/commands/org/list.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/org/list.ts)_

## `coveo org:search:dump`

Dump the content of one or more sources in CSV format.

```
USAGE
  $ coveo org:search:dump

OPTIONS
  -c, --chunkSize=chunkSize                [default: 10000] The maximum number of results to dump into each CSV file.

  -d, --destination=destination            [default: .] The folder in which to create the CSV files. The data dump will
                                           fail if the folder doesn't exist.

  -f, --additionalFilter=additionalFilter  The additional search filter to apply while getting the content. See
                                           <https://docs.coveo.com/en/1552>.

  -n, --name=name                          [default: indexdump] The base name to use when creating a new CSV file. If
                                           more than one file is created, the CLI will append `_2`, `_3`, etc. to each
                                           new file name after the first one.

  -p, --pipeline=pipeline                  The name of the query pipeline through which to get content. If not
                                           specified, the default query pipeline is used.

  -s, --source=mySourceName                (required) The names (not the identifiers) of the sources from which to get
                                           content.

  -x, --fieldsToExclude=fieldsToExclude    The fields to exclude from the data dump. If not specified, all fields are
                                           included.
```

_See code: [src/commands/org/search/dump.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/org/search/dump.ts)_

## `coveo source:push:add SOURCEID`

Push a JSON document into a Coveo Push source. See https://github.com/coveo/cli/wiki/Pushing-JSON-files-with-Coveo-CLI for more information.

```
USAGE
  $ coveo source:push:add SOURCEID

ARGUMENTS
  SOURCEID  The identifier of the source on which to perform the add operation. See source:push:list to obtain the
            identifier.

OPTIONS
  -d, --folder=./my_folder_with_multiple_json_files  One or multiple folder containing json files. Can be repeated
  -f, --file=myfile.json                             One or multiple file to push. Can be repeated.
```

_See code: [src/commands/source/push/add.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/source/push/add.ts)_

## `coveo source:push:delete SOURCEID`

Delete one or multiple items in a given Push source. See <https://docs.coveo.com/en/171> and <https://docs.coveo.com/en/131>

```
USAGE
  $ coveo source:push:delete SOURCEID

ARGUMENTS
  SOURCEID  The identifier of the Push source on which to perform the delete operation. To retrieve the list of
            available Push source identifiers, use the `source:push:list` command.

OPTIONS
  -c, --deleteChildren
      Whether to delete all items that share the same base URI as the specified item to delete.

  -d, --deleteOlderThan=2000-01-01T00:00:00-06:00 OR 946702800
      If this flag is set, all items that have been added or updated in the source before the specified ISO 8601 date or 
      Unix timestamp will be deleted. The documents will be deleted using the default queueDelay, meaning they will stay 
      in the index for about 15 minutes after being marked for deletion.

  -x, --delete=delete
      The URIs of the items to delete. Can be repeated. If you want to delete more than one specific items, use the 
      `source:push:batch` command instead.
```

_See code: [src/commands/source/push/delete.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/source/push/delete.ts)_

## `coveo source:push:list`

List all available push sources in your Coveo organization

```
USAGE
  $ coveo source:push:list

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

_See code: [src/commands/source/push/list.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/source/push/list.ts)_

## `coveo source:push:new NAME`

Create a new push source in a Coveo organization

```
USAGE
  $ coveo source:push:new NAME

ARGUMENTS
  NAME  The name of the source to create.

OPTIONS
  -v, --sourceVisibility=(PRIVATE|SECURED|SHARED)  [default: SECURED] Controls the content security option that should
                                                   be applied to the items in a source. See
                                                   https://docs.coveo.com/en/1779/index-content/content-security
```

_See code: [src/commands/source/push/new.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/source/push/new.ts)_

## `coveo ui:create:angular NAME`

Create a Coveo Headless-powered search page with the Angular web framework. See <https://docs.coveo.com/headless> and <https://angular.io/>.

```
USAGE
  $ coveo ui:create:angular NAME

ARGUMENTS
  NAME  The name of the application to create.

OPTIONS
  -d, --defaults         Whether to automatically select the default value for all prompts that have a default value.
  -v, --version=version  [default: 1.19.0] The version of @coveo/angular to use.
```

_See code: [src/commands/ui/create/angular.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/ui/create/angular.ts)_

## `coveo ui:create:react NAME`

Create a Coveo Headless-powered search page with the React web framework. See <https://docs.coveo.com/headless> and <https://reactjs.org/>.

```
USAGE
  $ coveo ui:create:react NAME

ARGUMENTS
  NAME  The name of the application to create.

OPTIONS
  -v, --version=version  [default: 1.19.0] Version of @coveo/cra-template to use.

EXAMPLES
  $ coveo ui:create:react myapp
  $ coveo ui:create:react --help
```

_See code: [src/commands/ui/create/react.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/ui/create/react.ts)_

## `coveo ui:create:vue NAME`

Create a Coveo Headless-powered search page with the Vue.js web framework. See <https://docs.coveo.com/headless> and <https://vuejs.org/>.

```
USAGE
  $ coveo ui:create:vue NAME

ARGUMENTS
  NAME  The name of the application to create.

OPTIONS
  -h, --help             show CLI help

  -p, --preset=path      The path to a JSON file with pre-defined options and plugins for creating a new project.
                         If not specified, the default TypeScript preset is used.
                         For more information about Vue CLI presets, see
                         https://cli.vuejs.org/guide/plugins-and-presets.html#presets.

  -v, --version=version  [default: 1.19.0] The version of @coveo/vue-cli-plugin-typescript to use.

EXAMPLES
  $ coveo ui:create:vue --preset path/to/my/preset.json
  $ coveo ui:create:vue --help
```

_See code: [src/commands/ui/create/vue.ts](https://github.com/coveo/cli/blob/v1.19.0/packages/cli/src/commands/ui/create/vue.ts)_

## `coveo update [CHANNEL]`

update the coveo CLI

```
USAGE
  $ coveo update [CHANNEL]

OPTIONS
  --from-local  interactively choose an already installed version
```

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v1.5.0/src/commands/update.ts)_
<!-- commandsstop -->

```

```
