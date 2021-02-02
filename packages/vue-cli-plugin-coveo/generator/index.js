// eslint-disable-next-line no-unused-vars
module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    dependencies: {
      '@coveo/headless': '^0.1.0',
      buefy: '^0.9.4',
    },
    devDependencies: {
      'node-sass': '^5.0.0',
      'sass-loader': '^10.1.1',
    },
  });

  api.render('./template', {
    //   TODO: inject the appropriate file type
    ...options,
  });
};
