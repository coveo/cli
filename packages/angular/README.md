# Installation and Code Generation

The `@coveo/angular` package contains the necessary components to set up a search page with Angular CLI.

## Install Schematic

Using the command below will set up a Coveo search page in your project

```
ng add @coveo/angular --orgId<org-id> --apiKey=<api-key>
```

<!-- TODO: add links to the appropriate documentation -->

The `ng add` schematic helps you set up an Angular CLI project that uses [@coveo/headless](https://www.npmjs.com/package/@coveo/headless) and [Material Angular](https://material.angular.io/). Running `ng add` will:

- Ensure [Coveo Headless](https://www.npmjs.com/package/@coveo/headless) and [Material Angular](https://material.angular.io/) dependencies are placed in `package.json`
- Generate the Coveo Headless Engine
- Generate search page components (search box, result list, facets, ...)
  <!-- - Add the [Material Icon font](./getting-started#step-6-optional-add-material-icons) to your `index.html` -->
  <!-- - Add either a [prebuilt theme](./theming#using-a-pre-built-theme) or a [custom theme](./theming#defining-a-custom-theme) -->
  <!-- - Add global styles to
    - Remove margins from `body`
    - Set `height: 100%` on `html` and `body`
    - Make Roboto the default font of your app -->

## Component schematics

### Headless Engine schematic

Running the `headless-engine` schematic only generates the Coveo Headless engine without additional components.

```
ng generate @coveo/angular:headless-engine --orgId<org-id> --apiKey=<api-key>
```

## Development

### Testing

To test the schematic locally, install `@angular-devkit/schematics-cli` globally and use the `schematics` command-line tool. That tool mimics `generate` and `add` commands of the Angular CLI.

Check the documentation with

```bash
schematics --help
```

First of all, create a new project:

```
ng new my-test-app --routing --style css
```

Make sure to link your local schematic to the project you want to use it in.

```
cd my-test-app
npm link /path/to/coveo-cli/packages/angular
```

> You can also use `npm pack` in your schematics project, then `npm install /path/to/artifact.tar.gz` in your Angular project.
> This mimics `npm install` more than npm link.

Run your schematic

```
schematics @coveo/angular:headless-engine --orgId<org-id> --apiKey=<api-key> --dry-run
```

### Unit Testing

`npm run test` will run the unit tests, using Jasmine as a runner and test framework.

### Publishing

To publish, simply do:

```bash
npm run build
npm publish
```

That's it!
