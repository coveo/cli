# Before publishing your custom Atomic component

Before publishing and sharing your custom atomic component with others, it needs to comply to a set of standards.

This is a guide to publish a custom StencilJS component with the [Coveo Atomic framework](https://docs.coveo.com/en/atomic/latest/). This guide assumes you have basic knowledge of [StencilJS](https://stenciljs.com/docs/introduction) and TypeScript. If you are new to these technologies, we recommend reading the official documentation first.

### Useful links on Coveo Atomic framework

- [Coveo Atomic Tutorial](https://levelup.coveo.com/learn/courses/atomic)
- [Create Custom Coveo Atomic Components](https://docs.coveo.com/en/atomic/latest/usage/create-custom-components/)

## Minimum requirements

The next sections will detail the minimum requirements needed by your component to make sure it can be published.
Assuming you already have created a project with the CLI with the following command `coveo atomic:component my-custom-component`, you will end up with a project with the following structure:

<!-- TODO: add link to how to create a custom component with the CLI -->

```bash
src/components/my-custom-component/
├── package.json
├── src
│   ├── my-custom-component.css
│   └── my-custom-component.tsx
├── stencil.config.ts
└── tsconfig.json
```

### Required package.json fields

The project with come with a pre-generated `package.json` file. However, you need to fill additional fields like [description](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#description) and [homepage](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#homepage), which are required for publishing.

These properties are crucial for other developer to understand the purpose of your component as well as the homepage hosting the source code.

Other fields will already populated if you create your custom component with the [Coveo CLI](https://docs.coveo.com/en/cli/).
Some of them:

#### name

You must provide a name for your custom component.

#### unpkg

You must provide the path to the `.esm.js` file of your custom component. You can find it under the `dist/` folder once you build the component.

#### keywords

The package.json `keywords` array should include `coveo-atomic-component`, otherwise your component will not be listed along with other Coveo custom components. See https://docs.npmjs.com/cli/v9/configuring-npm/package-json#keywords

### Documenting your component

Make sure a `readme.md` file is included in the component directory, which is the same location of the component's `package.json`.
The readme file should explain the puporse of your component as well as configuration and usage instructions (if needed).

### Component name

If you are getting the following error, continue reading. Otherwise, skip to the next section.

```bash
Component tag name from your .tsx file does not match the \`elementName\` property defined in your component's package.json file. Make sure both values are identical
```

You should not get the above error unless you manually changed the component name in either your `.tsx` file or `package.json`.
Assuming you have created a custom component called `my-custom-component`, you should end up with the following files

```tsx
// src/components/my-custom-component/src/my-custom-component.tsx
import {Component, h} from '@stencil/core';

@Component({
  tag: 'my-custom-component',
  styleUrl: 'my-custom-component.css',
  shadow: true,
})
export class MyCustomComponent {
  render() {
    return (
      <div>
        <coveo-button>Click me</coveo-button>
      </div>
    );
  }
}
```

in the `package.json`, the `elementName` property needs to have the same tag name.

```json
// src/components/my-custom-component/package.json
{
  "name": "@coveo/my-custom-component",
  "description": "This compone TODO:",
  "version": "0.0.1",
  "keywords": [
    "coveo-atomic-component"
  ],
  ...
  "elementName": "my-custom-component",
}
```

As you can see, both the `tag` decorator in the `my-custom-component.tsx` file and `elementName` field in the `package.json` match. This should be automatic if you have created your custom component with the [Coveo CLI](https://docs.coveo.com/en/cli/). Otherwise, make sure to address the inconsistency before publishing.

<!-- TODO: CDX-1266: Coveo internal components -->

## Optional requirements

### Writing tests

Adding tests to your custom component will improve your component quality and prevent potential errors. Visit [Jest - Getting Started](https://jestjs.io/docs/getting-started) for more info.

### Using TypeScript

TypeScript is a strongly typed superset of JavaScript that can help you catch errors and improve the quality of your code. By using TypeScript, you can catch errors at compile-time, rather than at runtime, which can save you time and effort in debugging.

## Published

Once your component is published and available in [npm](https://npmjs.com/) it will be indexed by Coveo and should be available in the [Custom Component Search page](https://docs.coveo.com/en/atomic/latest/cc-search/) shortly.
