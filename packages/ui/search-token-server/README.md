# Simple search token generation server

An [Express](https://www.npmjs.com/package/express) server to generate [Coveo search tokens](https://docs.coveo.com/en/1346/).

## Setup environment

Create the `.env` file at the root of this project using `.env.example` as starting point and make sure to replace all placeholder variables `<...>` by the proper information for your organization.
For more involved configurations, you can modify the request parameters used in the `middlewares/searchToken.ts` file.

## Installation

```bash
npm install
```

## Usage

```bash
npm start
```

This will start a server listening on port 3000. The app will return a [Coveo search token](https://docs.coveo.com/en/1346/) when you make a GET request to the [/token](http://localhost:3000/token) path. Every other path will respond by a **404 Not Found** error.

## Documentation

### Search Token Authentication

A search token is a special JSON web token typically used to temporarily grant the privilege to execute queries as a specific user and log usage analytics events.
To understand search tokens and how they work in more detail, visit the [Search Token Authentication](https://docs.coveo.com/en/56/build-a-search-ui/search-token-authentication) page.
