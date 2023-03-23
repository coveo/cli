import {z} from 'zod';

export default z.object({
  name: z.string({
    required_error: 'You must provide a name for your custom component.',
  }),
  // elementName: z.string({
  //   // TODO: CDX-1389: https://stenciljs.com/docs/component#tag
  // }),
  unpkg: z.string({
    required_error:
      'You must provide the path to the `.esm.js` file of your custom component. You can find it under the `dist/` folder once you build the component.',
  }),
  keywords: z
    .string({
      required_error:
        'You must populate the `keywords` property. See https://docs.npmjs.com/cli/v9/configuring-npm/package-json#keywords',
    })
    .array()
    .refine((keywords) => keywords.includes('coveo-atomic-component'), {
      message:
        'The package.json `keywords` array should include `coveo-atomic-component`, otherwise your component will not be listed along with other Coveo custom components. See https://docs.npmjs.com/cli/v9/configuring-npm/package-json#keywords',
    }),
  description: z
    .string({
      required_error:
        'You must provide a description at least 20 characters long to explain the component purpose.',
    })
    .min(20, {
      message: 'The component description must be at least 20 characters long',
    }),
  homepage: z
    .string({
      required_error:
        'You must provide a URL to the component source code. See https://docs.npmjs.com/cli/v9/configuring-npm/package-json#homepage',
    })
    .url({
      message:
        'Please provide a valid url to the component homepage. See https://docs.npmjs.com/cli/v9/configuring-npm/package-json#homepage',
    }),
});
