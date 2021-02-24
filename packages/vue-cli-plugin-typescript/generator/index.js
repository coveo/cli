module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    scripts: {
      postinstall: 'node ./scripts/setup-server.js',
      start: 'concurrently --raw "npm run start-server"  "npm run serve"',
      'start-server': 'node ./scripts/start-server.js',
    },
    dependencies: {
      '@coveo/headless': '^0.1.0',
      '@coveo/search-token-server':
        'file:/Users/ylakhdar/Repos/coveo-cli/packages/search-token-server/search-token-server-0.0.0.tgz',
      buefy: '^0.9.4',
      concurrently: '^5.3.0',
    },
  });

  api.render('./template', {
    ...rootOptions,
    ...options,
  });
};
