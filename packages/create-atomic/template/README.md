# Atomic

This project was generated with [@coveo/create-atomic](https://npmjs.com/package/@coveo/create-atomic).

## Setup environment

The root folder should contain a `.env` file. Replace all placeholder variables (`<...>`) by the proper information for your organization. Consult the example configuration file named `.env.example` as needed. For more involved configurations, you can modify the request parameters used in the `lambda/functions/token/token.ts` file.

### CDN

By default, the project installs the latest major Atomic version, v1, to allow types and more advanced customizations. [Coveo Headless](https://www.npmjs.com/package/@coveo/headless) is also bundled with Atomic and accessible at `@coveo/atomic/headless`.

When running, the app will use the Atomic Coveo CDN with the deployed v1, at [https://static.cloud.coveo.com/atomic/v1/](https://static.cloud.coveo.com/atomic/v1/atomic.esm.js).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode, launching the [Netlify CLI dev command](https://cli.netlify.com/commands/dev).
Open [http://localhost:8888](http://localhost:8888) to view it in the browser.

The page will reload if you make edits.

This command will also start a serverless lambda function that will generate [Coveo search tokens](https://docs.coveo.com/en/1346/) at [http://localhost:8888/.netlify/functions/token](http://localhost:8888/.netlify/functions/token).
_See [@coveo/search-token-lambda](https://www.npmjs.com/package/@coveo/search-token-lambda)_

### `npm run dev:live`

Runs the app in the development mode and provides a shareable link for collaborators, launching the [Netlify CLI dev live command](https://cli.netlify.com/commands/dev).

### `npm run build`

Builds the app for production to the `dist` folder using [Webpack](https://webpack.js.org/).

### `npm run site:init`

Configure continuous deployment for a new or existing site, launching the [Netlify CLI init command](https://cli.netlify.com/commands/init).

### `npm run site:deploy`

Builds the app for production and deploys the `dist` folder to the linked Netlify site, launching the [Netlify CLI deploy command](https://cli.netlify.com/commands/deploy).

## Learn More

To learn more about Atomic, check out the [Atomic documentation](https://docs.coveo.com/en/atomic/latest/).
