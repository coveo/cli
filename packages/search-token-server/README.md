# Simple search token generation server

An [Express](https://www.npmjs.com/package/express) server to generate [Coveo Search Tokens](https://docs.coveo.com/en/1346/).

## Setup environment

Create the `.env` file at the root of this project using `.env.example` as starting point and make sure to replace all placeholder variables `<...>` by the proper information for your organization.

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

This will start a server listening on port 3000. The app will return a [Coveo Search Tokens](https://docs.coveo.com/en/1346/) for requests to the url [/token](http://localhost:3000/token). For every other path, it will respond with a **404 Not Found**.

## Documentation

### Search Token Authentication

To understand how [search tokens](https://docs.coveo.com/en/1346/) are generated, visit the [Search Token Authentication](https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication) page.

### Manage API Keys

To manage your API keys from the [Coveo Cloud Administration Console](https://docs.coveo.com/en/183/), visit the [Manage API Keys](https://docs.coveo.com/en/1718) page.
