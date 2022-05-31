# @coveo/cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![Codecov](https://codecov.io/gh/coveo/cli/branch/master/graph/badge.svg)](https://codecov.io/gh/coveo/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@coveo/cli.svg)](https://npmjs.org/package/@coveo/cli)
[![License](https://img.shields.io/npm/l/@coveo/cli.svg)](https://github.com/coveo/cli/blob/master/package.json)

<!-- toc -->

- [@coveo/cli](#coveocli)
- [Usage](#usage)
- [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @coveo/cli
$ coveo COMMAND
running command...
$ coveo (--version)
@coveo/cli/1.29.0 linux-x64 node-v16.15.0
$ coveo --help [COMMAND]
USAGE
  $ coveo COMMAND
...
```

<!-- usagestop -->

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
- [`coveo source:catalog:add SOURCEID`](#coveo-sourcecatalogadd-sourceid)
- [`coveo source:catalog:new NAME`](#coveo-sourcecatalognew-name)
- [`coveo source:list`](#coveo-sourcelist)
- [`coveo source:push:add SOURCEID`](#coveo-sourcepushadd-sourceid)
- [`coveo source:push:delete SOURCEID`](#coveo-sourcepushdelete-sourceid)
- [`coveo source:push:list`](#coveo-sourcepushlist)
- [`coveo source:push:new NAME`](#coveo-sourcepushnew-name)
- [`coveo ui:create:angular NAME`](#coveo-uicreateangular-name)
- [`coveo ui:create:atomic NAME`](#coveo-uicreateatomic-name)
- [`coveo ui:create:react NAME`](#coveo-uicreatereact-name)
- [`coveo ui:create:vue NAME`](#coveo-uicreatevue-name)
- [`coveo update [CHANNEL]`](#coveo-update-channel)
- [`coveo version`](#coveo-version)

## `coveo auth:login`

Log in to the Coveo Platform using the OAuth2 flow.

```
USAGE
  $ coveo auth:login [-r US|EU|AU] [-e dev|qa|hipaa|prod] [-o <value>]

FLAGS
  -e, --environment=<option>  [default: prod] The Coveo Platform environment to log in to.
                              <options: dev|qa|hipaa|prod>
  -o, --organization=myOrgID  The identifier of the organization to log in to. If not specified, the CLI logs you in to
                              the first available organization. See also commands `config:get`, `config:set`, and
                              `org:list`.
  -r, --region=<option>       [default: us] The Coveo Platform region to log in to. See
                              <https://docs.coveo.com/en/2976>.
                              <options: US|EU|AU>

DESCRIPTION
  Log in to the Coveo Platform using the OAuth2 flow.

EXAMPLES
  $ coveo auth:login
```

_See code: [src/commands/auth/login.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/auth/login.ts)_

## `coveo auth:token`

Log in to the Coveo Platform using an access token.

```
USAGE
  $ coveo auth:token -t <value> [-r US|EU|AU] [-e dev|qa|hipaa|prod]

FLAGS
  -e, --environment=<option>  [default: prod] The Coveo Platform environment to log in to.
                              <options: dev|qa|hipaa|prod>
  -r, --region=<option>       [default: us] The Coveo Platform region to log in to. See
                              <https://docs.coveo.com/en/2976>.
                              <options: US|EU|AU>
  -t, --token=xxx-api-key     (required) The API-Key that shall be used to authenticate you to the organization. See
                              <https://github.com/coveo/cli/wiki/Using-the-CLI-using-an-API-Key>.

DESCRIPTION
  Log in to the Coveo Platform using an access token.

EXAMPLES
  $ coveo auth:token
```

_See code: [src/commands/auth/token.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/auth/token.ts)_

## `coveo config:get [KEY]`

Display the current configuration.

```
USAGE
  $ coveo config:get [KEY]

ARGUMENTS
  KEY  The config key for which to show the value

DESCRIPTION
  Display the current configuration.

EXAMPLES
  $ coveo config:get

  $ coveo config:get organization

  $ coveo config:get accessToken
```

_See code: [src/commands/config/get.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/config/get.ts)_

## `coveo config:set`

Modify the current configuration.

```
USAGE
  $ coveo config:set [-r US|EU|AU] [-e dev|qa|hipaa|prod] [-o <value>] [-a y|n]

FLAGS
  -a, --analytics=<option>    Whether to enable analytics and telemetry tracking.
                              <options: y|n>
  -e, --environment=<option>  The Coveo Platform environment to log in to.
                              <options: dev|qa|hipaa|prod>
  -o, --organization=myOrgID  The identifier of the organization inside which to perform operations. See
                              <https://docs.coveo.com/en/1562/#organization-id-and-other-information>.
  -r, --region=<option>       The Coveo Platform region to log in to. See <https://docs.coveo.com/en/2976>.
                              <options: US|EU|AU>

DESCRIPTION
  Modify the current configuration.
```

_See code: [src/commands/config/set.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/config/set.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

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

_See code: [src/commands/org/create.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/create.ts)_

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

_See code: [src/commands/org/list.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/list.ts)_

## `coveo org:resources:list`

(beta) List available snapshots from an organization

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
  (beta) List available snapshots from an organization
```

_See code: [src/commands/org/resources/list.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/resources/list.ts)_

## `coveo org:resources:model:create`

(beta) Create a Snapshot Pull Model

```
USAGE
  $ coveo org:resources:model:create

DESCRIPTION
  (beta) Create a Snapshot Pull Model
```

_See code: [src/commands/org/resources/model/create.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/resources/model/create.ts)_

## `coveo org:resources:monitor SNAPSHOTID`

(beta) Monitor a Snapshot operation

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
  (beta) Monitor a Snapshot operation
```

_See code: [src/commands/org/resources/monitor.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/resources/monitor.ts)_

## `coveo org:resources:preview`

(beta) Preview resource updates

```
USAGE
  $ coveo org:resources:preview [-w <value>] [-y] [-p light|detailed | ] [-o <value>] [-d] [-s <value>]

FLAGS
  -d, --showMissingResources                    Preview resources deletion when enabled
  -o, --organization=targetorganizationg7dg3gd  The unique identifier of the organization where to preview the changes
                                                If not specified, the organization you are connected to will be used.
  -p, --previewLevel=(light|detailed)           [default: detailed] The verbosity of the preview. The `light` preview is
                                                faster to generate but only contains a limited amount of information, as
                                                opposed to the `detailed` preview that takes more time to generate, but
                                                returns a diff representation of all the changes to apply.
  -s, --snapshotId=<value>                      The unique identifier of the snapshot to preview. If not specified, a
                                                new snapshot will be created from your local project. You can list
                                                available snapshots in your organization with org:resources:list
  -w, --wait=seconds                            [default: 60] The maximum number of seconds to wait before the commands
                                                exits with a timeout error. A value of zero means that the command will
                                                wait indefinitely.
  -y, --sync                                    Apply synchronization when there is a 100% match between organization
                                                and snapshot resources.

DESCRIPTION
  (beta) Preview resource updates
```

_See code: [src/commands/org/resources/preview.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/resources/preview.ts)_

## `coveo org:resources:pull`

(beta) Pull resources from an organization

```
USAGE
  $ coveo org:resources:pull [-w <value>] [-o <value>] [-g] [-f] [-m <value> | [-s <value> | -r
    EXTENSION|FEATURED_RESULT|FIELD|FILTER|MAPPING|ML_MODEL|ML_MODEL_ASSOCIATION|QUERY_PARAMETER|QUERY_PIPELINE|QUERY_PI
    PELINE_CONDITION|RANKING_EXPRESSION|RANKING_WEIGHT|SEARCH_PAGE|SECURITY_PROVIDER|SOURCE|STOP_WORD|SUBSCRIPTION|THESA
    URUS|TRIGGER] |  | ]

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
  -r, --resourceTypes=type1 type2...            [default: EXTENSION,FEATURED_RESULT,FIELD,FILTER,MAPPING,ML_MODEL,ML_MOD
                                                EL_ASSOCIATION,QUERY_PARAMETER,QUERY_PIPELINE,QUERY_PIPELINE_CONDITION,R
                                                ANKING_EXPRESSION,RANKING_WEIGHT,SEARCH_PAGE,SECURITY_PROVIDER,SOURCE,ST
                                                OP_WORD,SUBSCRIPTION,THESAURUS,TRIGGER] The resources types to pull from
                                                the organization.
  -s, --snapshotId=<value>                      The unique identifier of the snapshot to pull. If not specified, a new
                                                snapshot will be created. You can list available snapshot in your
                                                organization with org:resources:list
  -w, --wait=seconds                            [default: 60] The maximum number of seconds to wait before the commands
                                                exits with a timeout error. A value of zero means that the command will
                                                wait indefinitely.

DESCRIPTION
  (beta) Pull resources from an organization
```

_See code: [src/commands/org/resources/pull.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/resources/pull.ts)_

## `coveo org:resources:push`

(beta) Preview, validate and deploy your changes to the destination org

```
USAGE
  $ coveo org:resources:push [-w <value>] [-y] [-p light|detailed | -s] [-o <value>] [-d]

FLAGS
  -d, --deleteMissingResources                  Delete missing resources when enabled
  -o, --organization=targetorganizationg7dg3gd  The unique identifier of the organization where to send the changes If
                                                not specified, the organization you are connected to will be used.
  -p, --previewLevel=(light|detailed)           [default: detailed] The verbosity of the preview. The `light` preview is
                                                faster to generate but only contains a limited amount of information, as
                                                opposed to the `detailed` preview that takes more time to generate, but
                                                returns a diff representation of all the changes to apply.
  -s, --skipPreview                             Do not preview changes before applying them to the organization
  -w, --wait=seconds                            [default: 60] The maximum number of seconds to wait before the commands
                                                exits with a timeout error. A value of zero means that the command will
                                                wait indefinitely.
  -y, --sync                                    Apply synchronization when there is a 100% match between organization
                                                and snapshot resources.

DESCRIPTION
  (beta) Preview, validate and deploy your changes to the destination org
```

_See code: [src/commands/org/resources/push.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/resources/push.ts)_

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
                                    default query pipeline is used.
  -s, --source=mySourceName...      (required) The names (not the identifiers) of the sources from which to get content.
  -x, --fieldsToExclude=<value>...  The fields to exclude from the data dump. If not specified, all fields are included.

DESCRIPTION
  Dump the content of one or more sources in CSV format.
```

_See code: [src/commands/org/search/dump.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/org/search/dump.ts)_

## `coveo source:catalog:add SOURCEID`

Index a JSON document into a Coveo Catalog source. See https://docs.coveo.com/en/2956 for more information.

```
USAGE
  $ coveo source:catalog:add [SOURCEID] [-f <value>] [-c <value> | ] [-m] [--fullUpload] [--skipFullUploadCheck]

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

_See code: [src/commands/source/catalog/add.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/source/catalog/add.ts)_

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

_See code: [src/commands/source/catalog/new.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/source/catalog/new.ts)_

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

_See code: [src/commands/source/list.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/source/list.ts)_

## `coveo source:push:add SOURCEID`

Index a JSON document into a Coveo Push source. See https://github.com/coveo/cli/wiki/Pushing-JSON-files-with-Coveo-CLI for more information.

```
USAGE
  $ coveo source:push:add [SOURCEID] [-f <value>] [-c <value> | ] [-m]

ARGUMENTS
  SOURCEID  The identifier of the source on which to perform the add operation. See source:list to obtain the
            identifier.

FLAGS
  -c, --maxConcurrent=<value>     [default: 10] The maximum number of requests to send concurrently. Increasing this
                                  value increases the speed at which documents are indexed to the Coveo platform.
                                  However, if you run into memory or throttling issues, consider reducing this value.
  -f, --files=myfile.json...      Combinaison of JSON files and folders (containing JSON files) to push. Can be
                                  repeated.
  -m, --[no-]createMissingFields  Analyse documents to detect and automatically create missing fields in the destination
                                  organization. When enabled, an error will be thrown if a field is used to store data
                                  of inconsistent type across documents.

DESCRIPTION
  Index a JSON document into a Coveo Push source. See
  https://github.com/coveo/cli/wiki/Pushing-JSON-files-with-Coveo-CLI for more information.
```

_See code: [src/commands/source/push/add.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/source/push/add.ts)_

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
      `source:push:batch` command instead.

DESCRIPTION
  Delete one or multiple items in a given Push source. See <https://docs.coveo.com/en/171> and
  <https://docs.coveo.com/en/131>
```

_See code: [src/commands/source/push/delete.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/source/push/delete.ts)_

## `coveo source:push:list`

[35m[Deprecated][39m List all available push sources in your Coveo organization

```
USAGE
  $ coveo source:push:list [--columns <value> | -x] [--sort <value>] [--filter <value>] [--output csv|json|yaml |  |
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
  [Deprecated] List all available push sources in your Coveo organization
```

_See code: [src/commands/source/push/list.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/source/push/list.ts)_

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

_See code: [src/commands/source/push/new.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/source/push/new.ts)_

## `coveo ui:create:angular NAME`

Create a Coveo Headless-powered search page with the Angular web framework. See <https://docs.coveo.com/headless> and <https://angular.io/>.

```
USAGE
  $ coveo ui:create:angular [NAME] [-v <value>] [-d]

ARGUMENTS
  NAME  The name of the application to create.

FLAGS
  -d, --defaults         Whether to automatically select the default value for all prompts that have a default value.
  -v, --version=<value>  [default: 1.29.0] The version of @coveo/angular to use.

DESCRIPTION
  Create a Coveo Headless-powered search page with the Angular web framework. See <https://docs.coveo.com/headless> and
  <https://angular.io/>.
```

_See code: [src/commands/ui/create/angular.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/ui/create/angular.ts)_

## `coveo ui:create:atomic NAME`

Create a Coveo Headless-powered search page with Coveo's own Atomic framework. See <https://docs.coveo.com/atomic> and <https://docs.coveo.com/headless>.

```
USAGE
  $ coveo ui:create:atomic [NAME] [-v <value>] [-p <value>]

ARGUMENTS
  NAME  The name of the application to create.

FLAGS
  -p, --pageId=7944ff4a-9943-4999-a3f6-3e81a7f6fb0a  The hosted search page ID.
  -v, --version=<value>                              [default: 1.29.0] The version of @coveo/create-atomic to use.

DESCRIPTION
  Create a Coveo Headless-powered search page with Coveo's own Atomic framework. See <https://docs.coveo.com/atomic> and
  <https://docs.coveo.com/headless>.

EXAMPLES
  $ coveo ui:create:atomic myapp
```

_See code: [src/commands/ui/create/atomic.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/ui/create/atomic.ts)_

## `coveo ui:create:react NAME`

Create a Coveo Headless-powered search page with the React web framework. See <https://docs.coveo.com/headless> and <https://reactjs.org/>.

```
USAGE
  $ coveo ui:create:react [NAME] [-v <value>]

ARGUMENTS
  NAME  The name of the application to create.

FLAGS
  -v, --version=<value>  [default: 1.29.0] Version of @coveo/cra-template to use.

DESCRIPTION
  Create a Coveo Headless-powered search page with the React web framework. See <https://docs.coveo.com/headless> and
  <https://reactjs.org/>.

EXAMPLES
  $ coveo ui:create:react myapp

  $ coveo ui:create:react --help
```

_See code: [src/commands/ui/create/react.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/ui/create/react.ts)_

## `coveo ui:create:vue NAME`

Create a Coveo Headless-powered search page with the Vue.js web framework. See <https://docs.coveo.com/headless> and <https://vuejs.org/>.

```
USAGE
  $ coveo ui:create:vue [NAME] [-v <value>] [-p <value>]

ARGUMENTS
  NAME  The name of the application to create.

FLAGS
  -p, --preset=path      The path to a JSON file with pre-defined options and plugins for creating a new project.
                         If not specified, the default TypeScript preset is used.
                         For more information about Vue CLI presets, see
                         https://cli.vuejs.org/guide/plugins-and-presets.html#presets.
  -v, --version=<value>  [default: 1.29.0] The version of @coveo/vue-cli-plugin-typescript to use.

DESCRIPTION
  Create a Coveo Headless-powered search page with the Vue.js web framework. See <https://docs.coveo.com/headless> and
  <https://vuejs.org/>.

EXAMPLES
  $ coveo ui:create:vue --preset path/to/my/preset.json

  $ coveo ui:create:vue --help
```

_See code: [src/commands/ui/create/vue.ts](https://github.com/coveo/cli/blob/v1.29.0/packages/cli/src/commands/ui/create/vue.ts)_

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

_See code: [@oclif/plugin-update](https://github.com/oclif/plugin-update/blob/v3.0.0/src/commands/update.ts)_

## `coveo version`

```
USAGE
  $ coveo version
```

_See code: [@oclif/plugin-version](https://github.com/oclif/plugin-version/blob/v1.0.4/src/commands/version.ts)_

<!-- commandsstop -->

```

```
