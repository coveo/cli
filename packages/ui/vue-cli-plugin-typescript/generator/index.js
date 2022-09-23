module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    scripts: {
      postinstall: 'node ./scripts/setup-server.js',
      'allocate-port': 'node ./scripts/port-allocator.mjs',
      serve:
        'npm run allocate-port && concurrently --raw "npm run start-server" "vue-cli-service serve"',
      start: 'npm run serve',
      'start-server': 'node ./scripts/start-server.js',
    },
    dependencies: {
      '@coveo/headless': '*',
      '@coveo/search-token-server': '*',
      buefy: '^0.9.4',
      bulma: '^0.9.3',
      concurrently: '^5.3.0',
      dotenv: '^9.0.2',
      'get-port': '^5.1.1',
      'fs-extra': '^10.0.0',
    },
    devDependencies: {
      tslib: '^2.3.0',
    },
    'lint-staged': {
      'server/*.{js,ts}': ['eslint'],
    },
  });

  api.render('./template', {
    ...rootOptions,
    ...options,
  });
};
