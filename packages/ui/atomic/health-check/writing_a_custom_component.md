# Create a custom Atomic component with the Coveo CLI

## Build a Coveo custom Atomic component

Use the `coveo atomic:component` command to scaffold the boilerplate of a ....

### Examples

```
$ coveo atomic:component myAwesomeComponent
```

If you want to create a result component (a component to be placed in a result template, make sure to specify it with the `--type` flag)

```
$ coveo atomic:component --type=result mySuperResultComponent

```

```bash
.
├── package.json
├── readme.md
├── src
│   ├── components
│   │   └── atomic-myAwesomeComponent
│   │       ├── package.json
│   │       ├── src
│   │       │   ├── atomic-myAwesomeComponent.css
│   │       │   └── atomic-myAwesomeComponent.tsx
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

# Use a published Coveo custom Atomic component

Go to https://docs.coveo.com/en/atomic/latest/cc-search/

Click on `COPY UNPKG`
You shoud end up with the following string in the clipboard

```html
<!-- Include the following script in the <head> of the page -->
<script type="module" src="https://unpkg.com/custom-per-page"></script>

<!-- Add the following tag inside the atomic-search-interface -->
<custom-per-page></custom-per-page>
```

In your HTML page,

1. add the `<script>` in the head of the page
2. add the custom component tag inside the `atomic-search-interface`
