# Contributing to the Coveo CLI

The Coveo CLI repository is organized as a monorepo (see [monorepo.tools](https://monorepo.tools/)).
Its packages are split into three categories:

- UI: Under `packages/ui` you'll find the project 'gravitating' around the CLI that helps developers get started with a Headless implementation.
- CLI: Under `packages/cli` you'll find the 'vanilla' plugin of the CLI, the CLI itself and some utils to help with the development of the CLI and its plugins.
<!-- TODO: Remove when the E2E will finally be 'split' -->
- E2E: A special 'package' under `packages/cli-e2e`, which contains the end-to-end tests for the CLI and its included plugins.

The rest of this document will focus on the CLI and its plugins.

## The CLI Folder

The CLI folder contains three special projects:

- `cli-commons-dev`: a set of development utilities (e.g. eslint config) shared across the CLI and its plugins.
- `cli-commons`: a set of **production** utilities (e.g. error wrapping) shared across the CLI and its plugins.
- `core`: The CLI Itself.

This structure allows the CLI to ship as a bundle of bricks, rather than as a big chunky house.
However, `oclif` doesn't necessarily play nicely with this project structure

### The TypeScript Configs

You'll find up to 3 typescript configs in the CLI projects:

- `tsconfig.json`:
  - Here to serve as a 'local' base configuration for the more elaborate `tsconfig.build.json`, but more importantly;
  - Used as default by the language server of your IDE (think wiggly red lines)
- `tsconfig.dev.json`:
  - Only for CLI and plugins. Used when you run the commands in **dev** mode with OClif.
  - To work, it needs:
    - The `@oclif/core` patch
    - The custom `dev` node executable
- `tsconfig.build.json`:
  - Only used for the transpilation of the shipped packages.
  - It uses the aforementioned references to identify the 'external' bits.

### The package.json Files

When looking at `cli-commons` and `cli-commons-dev`, you'll see an `exports` field.
This gives instructions on where to find some files to the package resolver, so that the import interface stays simple and consistent between development and production.

For more info on that, see the [NodeJS documentation](https://nodejs.org/api/packages.html#subpath-exports).

All these configurations, one way or another, point to the `tsconfig.json` file of `cli-commons-dev`.

## The Release System

The CLI release is topological. This means that it will release first the packages without any dependency in the repo, then the packages that depend on them, and so forth until all packages are released.

> Example:
>
> - `cli/core` needs `cli/commons` and `cli/commons-dev`.
> - `cli/commons` needs `cli/commons-dev`.
> - `cli/commons-dev` does not have any dependency in the repo.
>
> Thus, the packages are released in the following order:
> `cli/commons-dev`, `cli-commons` and finally `cli/core`.

To define the topology, the repo uses [`nx`](https://nx.dev/) to generate a topology graph that is then consumed by the JS script [scripts/releaseV2/phase1-bump-all-packages.mjs](./scripts/releaseV2/phase1-bump-all-packages.mjs).

Essentially, each package goes through the following steps one by one:

- Check if it changed since the last release. If it didn't, then skip and move to the next package.
- Build the package.
- Generate a new version of the package (more on that later).
- Publish the package.
- Update the local dependencies of the package with its new version.
- Write itself down in the list of packages that have been published.

After all packages are released, [./scripts/releaseV2/phase2-git-commit-tag-push.mjs](./scripts/releaseV2/phase2-git-commit-tag-push.mjs) will commit all the changes. It will tag the commits with the incremental release id and tag the same commit with all the versions that have been published.

If `@coveo/cli` was released on `npm`, then a new GitHub release is created. The release will then trigger the generation of new binaries. After the binaries are created and attached, a deployment pipeline run must be triggered through Jenkins.

### Versioning

- Up until 1.35.12, the package versions are synchronized: the version x.y.z of `@coveo-cli` will use the version x.y.z of `@coveo/cli-commons` and so forth.
- After 1.35.12, the package versions are independent: the version x.y.z of `@coveo-cli` does not necessarily use the version x.y.z of `@coveo/cli-commons`.
