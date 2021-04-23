# <%- rootOptions.projectName %>

The `@coveo/vue-cli-plugin-typescript` package contains the necessary components to set up a search page using [Coveo Headless](https://docs.coveo.com/headless) and [Buefy](https://buefy.org/) with the [Vue CLI](https://cli.vuejs.org/).

If you want to create a new Coveo Headless-powered search page with the Vue.js web framework from scratch, it is simpler to use the [`coveo ui:create:vue` command in the Coveo CLI](https://github.com/coveo/cli/tree/master/packages/cli#coveo-uicreatevue-name). The Coveo CLI will handle a lot of complexity for you. Calling the `@coveo/vue-cli-plugin-typescript` package directly from the Angular CLI should rather be done to help you integrate a search page to an already existing Vue.js project.

## Installation

To add a Coveo Headless-powered search page using Buefy to an existing TypeScript Vue.js project, execute the following steps:

- Run `vue add @coveo/vue-cli-plugin-typescript`.
- The root folder should contain `.env` file. Replace all placeholder variables (`<...>`) by the proper information for your organization. Consult the example configuration file named `.env.example` as needed. For more involved configurations, you can modify the request parameters used in the `server/middlewares/searchToken.ts` file.
- Run `npm start`.

## Contributing

### Compiles and hot-reloads for development

```
npm start
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
