# Before publishing your custom Atomic component

Before publishing and sharing your custom atomic component with others, it needs to comply to a set of standards.

This is a guide to publish a custom StencilJS component with the [Coveo Atomic framework](https://docs.coveo.com/en/atomic/latest/). This guide assumes you have basic knowledge of [StencilJS](https://stenciljs.com/docs/introduction) and TypeScript. If you are new to these technologies, we recommend reading the official documentation first.

### Useful links on Coveo Atomic framework

- [Coveo Atomic Tutorial](https://levelup.coveo.com/learn/courses/atomic)
- [Create Custom Coveo Atomic Components](https://docs.coveo.com/en/atomic/latest/usage/create-custom-components/)

## Minimum requirements

The next sections will detail the minimum requirements needed by your component to make sure it can be published.
If you have created a project with the CLI using the following command `coveo atomic:component my-custom-component`, you should find a project with the following structure in your current working directory:

```bash
src/components/my-custom-component/
├── package.json
├── src
│   ├── my-custom-component.css
│   └── my-custom-component.tsx
├── stencil.config.ts
└── tsconfig.json
```

For more info on how to create a custom Atomic component with the Coveo CLI, visit ...

<!-- TODO: add link to how to create a custom component with the CLI -->

### Required package.json fields

The project comes with a pre-generated `package.json` file. However, you need to fill additional fields such as [description](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#description) and [homepage](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#homepage), which are required for publishing.

These fields are crucial for other developers to understand the purpose of your component as well as the homepage hosting its source code.

Other required fields will already be populated if you create your custom component with the [Coveo CLI](https://docs.coveo.com/en/cli/).

#### unpkg

This custom field is essential for ... path to the `.esm.js` file of your custom component.... By default, it is located inside the `dist/` folder once the custom component has been built. If however, you change the [output targets](https://stenciljs.com/docs/output-targets) of your builds, make sure to also update `unpkg` path in the `package.json`.

#### keywords

The package.json `keywords` array should include `coveo-atomic-component`, so it can be indexed by Coveo and listed in the [Custom Component Search page](https://docs.coveo.com/en/atomic/latest/cc-search/). You can add more keywords. See https://docs.npmjs.com/cli/v9/configuring-npm/package-json#keywords

### Documenting your component

Make sure a `readme.md` file is included in the component directory, at the same location of the component's `package.json`.
The readme file should explain the purpose of your component as well as configuration and usage instructions (if needed).

```bash
src/components/my-custom-component/
├── package.json
├── readme.md
├── src
├── stencil.config.ts
└── tsconfig.json
```

### Component name

If you are getting the following error while publishing, continue reading. Otherwise, skip to the next section.

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
