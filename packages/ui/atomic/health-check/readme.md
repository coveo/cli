# Health Check

This is a package that checks if your [Atomic](https://docs.coveo.com/en/atomic/latest/) custom components meet all the conditions required in order to be published.
It is designed to help you ensure that your component is healthy and easily sharable with other users.

## Installation

You can install Health Check using npm:

```bash
npm install health-check --save-dev
```

## Usage

Once installed, you can use Health Check by running the bin file (`atomic-meta-check`) available in the node modules:
It is meant to be used as a `prepublishOnly` script.
You can add it to your package.json:

```json
...
"scripts": {
    "prepublishOnly": "npm run build && atomic-meta-check",
},
...
"devDependencies": {
    "@coveo/atomic-component-health-check": "latest",
},
...
```

## Contributing

If you find a bug or have a feature request, please create an [issue](https://github.com/coveo/cli/issues) or submit a [pull request](https://github.com/coveo/cli/pulls).
