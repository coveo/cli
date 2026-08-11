# Changesets

This folder is managed by [Changesets](https://github.com/changesets/changesets).

When you make a user-facing change to a publishable package, run:

```sh
npx changeset
```

Follow the prompts to select the affected packages and describe the change.
The generated markdown file in this directory will be consumed by the release
workflow to determine version bumps and changelog entries.
