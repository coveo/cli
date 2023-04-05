Best Practices to Ensure All Assertions Are Passing:

Before publishing your custom atomic component, it needs to respect a certain standard so it can easily be shared to other developers.

### Required package.json fields

Ensure that all required fields are provided in the package.json file of the component. Some of these required fields like `description` and `homepage` are crucial for other developer to understand the purpose of your component as well as the homepage to the source code.

To do this, you can run the ensureRequiredProperties() function. If a required field is missing, an error will be thrown with a description of the missing field.

### Readme file

Make sure that a README.md file is included in the component directory. You can run the ensureReadme() function to check if this file exists. If it doesn't exist, an error will be thrown.
TODO: explain why this is important:

### Component name

This is already automatically handled. however, if you encounter this issue `TODO: add error message`, it's probably because you did a change to the component name and created an inconsistency.

TODO: explain why this is important:...
The stencil component tag name should match the readme

In this example,. we have a component named `my-custom-component`

```tsx
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

---

Ensure that the documentation file for the component is available in the docs/stencil-docs.json file. You can run the ensureDocFile() function to check if this file exists. If it doesn't exist, an error will be thrown.

Verify that the elementName property in the package.json file matches the tag name used by the custom component. You can use the ensureConsistentElementName() function to check if the elementName matches the component tag name in the docs/stencil-docs.json file. If the elementName does not match, an error will be thrown.

Ensure that the unpkg property is specified in the package.json file and that the path to the .esm.js file of the component is provided. You can use the Inspector class to check if the path is valid and the file exists.

Check that the keywords property is populated and includes the coveo-atomic-component keyword. You can use the Inspector class to verify that the keywords property is an array and includes the required keyword.

By following these best practices, you can ensure that all assertions are passing and your custom component is ready for publication.
