# Custom Atomic component with the Coveo CLI

## Build a Coveo custom Atomic component

Use the `coveo atomic:component` command to scaffold your project so you can start building your custom Atomic component leveraging [StencilJs](https://stenciljs.com/docs/getting-started). Upon successfully creating your project, the CLI will print something similar to the following to the console:

```bash
? What kind of component do you want to scaffold? result
✔ Project configured

  We suggest that you begin by typing:

  $ cd my-custom-component
  $ npm install
  $ npm start

  $ npm start
    Starts the development server.

  $ npm run build
    Builds your project in production mode.

  Further reading:

   - TODO: CDX-1403 Add link to documentation in source code and error message

  Happy coding! 🎈
```

The first section describes a few commands required to finish getting your custom component bootstrapped.

```bash
  $ cd my-custom-component
  $ npm install
  $ npm start
```

This will change your current directory to `my-custom-component`, install your dependencies for you, and start the development server.

### Building my first component

After running the `coveo atomic:component`, you will find the following structure in the current working directory:

```bash
.
├── package.json
├── readme.md
├── src
│   ├── components
│   │   └── my-awesome-component
│   │       ├── package.json
│   │       ├── src
│   │       │   ├── my-awesome-component.css
│   │       │   └── my-awesome-component.tsx
│   │       ├── stencil.config.ts
│   │       └── tsconfig.json
│   ├── html.d.ts
│   └── pages
│       ├── index.css
│       ├── index.html
│       └── index.ts
├── stencil.config.ts
└── tsconfig.json
```

You will find the source code to your custom component in `src/components/my-awesome-component/my-awesome-component.tsx` file:

```tsx
import { Component } from "@stencil/core";
import { ... } from "@coveo/atomic";
import { ... } from "@coveo/headless";

@Component({
  tag: "my-custom-component",
  styleUrl: "my-custom-component.css",
  shadow: true,
})
export class MyCustomComponent {
  // ...

  public async connectedCallback() {
    // ...
  }

  public disconnectedCallback() {
    // ...
  }

  public render() {
    // ...
  }
}
```

> For more detail about Stencil component, visit, [Getting Started with StencilJs](https://stenciljs.com/docs/getting-started).

Once compilted, the component can be used in HTML just like any other tag

```html
<my-custom-component hello="world"></my-custom-component>
```

Visit [TODO:]() for more info on how to publish and share your component with others.

## Using a published Coveo custom Atomic component

You can also use a already published custom Atomic component

All published components can be find in the Coveo [Custom Atomic Component Search Page](https://docs.coveo.com/en/atomic/latest/cc-search/).

To add one to your project, simply copy the [unpkg](https://unpkg.com/) link of the selected component by clicking on the `COPY UNPKG` button. Then, you shoud end up with a similar string in your clipboard.

```html
<!-- Include the following script in the <head> of the page -->
<script type="module" src="https://unpkg.com/custom-per-page"></script>

<!-- Add the following tag inside the atomic-search-interface -->
<custom-per-page></custom-per-page>
```

You can now add these 2 lines directly in your HTML page:

1. add the `<script>` in the head of the page
2. add the custom component tag inside the `atomic-search-interface`
