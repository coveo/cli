# @coveo/angular

The `@coveo/angular` package contains the necessary components to set up a search page using [Coveo Headless](https://docs.coveo.com/headless) and [Angular Material](https://material.angular.io/) with the [Angular CLI](https://cli.angular.io/).

If you want to create a new Coveo Headless-powered search page with the Angular web framework from scratch, it is simpler to use the [`coveo ui:create:angular` command in the Coveo CLI](https://github.com/coveo/cli/blob/master/packages/cli/README.md#coveo-uicreateangular-name). The Coveo CLI will handle a lot of complexity for you. Calling the `@coveo/angular` package directly from the Angular CLI should rather be done to help you integrate a search page to an already existing Angular project.

## Installation

To add a Coveo Headless-powered search page using Material Angular to an existing Angular project, execute the following steps:

- Run `ng add @coveo/angular --org-id=<org-id> --api-key=<api-key>`, where you replace `<org-id>` by the unique identifier of your Coveo organization, and `<api-key>` by an API key granting the **impersonate** privilege in the target organization.
- Answer the questions prompted in your terminal to configure your interface styling.
- In your project, navigate to the new `server` folder. This is an [Express](https://www.npmjs.com/package/express) server which generates [Coveo search tokens](https://docs.coveo.com/en/1346/).
- The folder should contain a `.env.example` file. Create a copy of that file and rename it `.env`.
- In that new `.env` file, replace all placeholder variables (`<...>`) by the proper information for your organization. For more involved configurations, you can modify the request parameters used in the `middlewares/searchToken.ts` file.
- You can now go back to the root directory of your project and serve it by running `ng serve`.

## Contributing

### Component schematics

TODO

### Development

TODO

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
schematics @coveo/angular:headless-engine --org-id<org-id> --api-key=<api-key> --dry-run
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
