// eslint-disable-next-line no-unused-vars
module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    dependencies: {
      '@coveo/headless': '^0.1.0',
      buefy: '^0.9.4',
      'material-design-icons': '^3.0.1',
    },
  });

  api.render('./template', {
    //   TODO: inject the appropriate file type
    ...options,
  });

//   api.onCreateComplete(() => {
//     // Injecting the appropriate type of file
//     const fs = require('fs');
//     const ext = api.hasPlugin('typescript') ? 'ts' : 'js';
//     const mainPath = api.resolve(`./src/main.${ext}`);
//   });
};
