# `cli-e2e`

> TODO: description

## Prerequisites

- Have `mitmproxy` installed and its binary in your path[^1]
- Chrome.

## How to run the tests?

1. Provide credentials.

- Recommend: just login into the cli. `coveo auth:login -e=qa/dev/prod -o=yourorgid`
- Advanced: fill up a `.env` file with the following variables:
  - PLATFORM_ENV: qa, dev, prod
  - ORG_ID: the org against which you'll be running tests (tests may or may not run with custom orgs)
  - ACCESS_TOKEN: An Access Token. Not an API Key, but an Access Token.

2. `npm jest`

3. ☕. Tests are long, if all goes well 10-12' on a good machine, 20'-25' on a decent one, 30-40' if they fail.

[^1]: mitmdump is the one of interest
