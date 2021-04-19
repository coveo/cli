# @coveo/vue-cli-plugin-typescript

> A [Vue CLI 2](https://github.com/vuejs/vue-cli) Plugin to set up a search page using [Coveo Headless](https://docs.coveo.com/headless) and [Buefy](https://buefy.org/documentation).
> If you want to create a new Coveo Headless-powered search page with the Vue.js web framework from scratch, it is simpler to use the [`coveo ui:create:vue` command in the Coveo CLI](https://github.com/coveo/cli/blob/master/packages/cli/README.md#coveo-uicreatevue-name). The Coveo CLI will handle a lot of complexity for you and automatically connect your project to your Coveo organization.

## Installing in an Already Created Project without the Coveo CLI

### Invoke the @coveo/typescript plugin

```
vue add @coveo/typescript
```

### Configure your Vue.js project

Once the `@coveo/typescript` plugin invoked, the project should contain a `.env.example` file. Create a copy of that file and rename it `.env`.
In that new `.env` file, replace all placeholder variables (`<...>`) by the proper information for your organization. For more involved configurations, you can modify the request parameters used in the `middlewares/searchToken.ts` file.

You can now go back to the root directory of your project and serve it by running `npm start`.
