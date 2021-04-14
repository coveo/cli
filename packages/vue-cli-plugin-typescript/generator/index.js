module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    scripts: {
      postinstall: 'node ./scripts/setup-server.js',
      serve:
        'concurrently --raw "npm run start-server"  "vue-cli-service serve"',
      start: 'npm run serve',
      'start-server': 'node ./scripts/start-server.js',
    },
    dependencies: {
      '@coveo/headless': '*',
      '@coveo/search-token-server': '*',
      buefy: '^0.9.4',
      concurrently: '^5.3.0',
    },
  });

  api.render('./template', {
    ...rootOptions,
    ...options,
  });
};
