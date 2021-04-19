module.exports = (api, options, rootOptions, invoking) => {
  api.injectImports(api.entryFile, `import router from './router'`);

  api.injectRootOptions(api.entryFile, 'router');

  api.extendPackage({
    scripts: {
      postinstall: 'node ./scripts/setup-server.js',
      serve:
        'concurrently --raw "npm run start-server" "vue-cli-service serve"',
      start: 'npm run serve',
      'start-server': 'node ./scripts/start-server.js',
    },
    dependencies: {
      '@coveo/headless': '*',
      '@coveo/search-token-server': '*',
      buefy: '^0.9.4',
      concurrently: '^5.3.0',
      'vue-router': '^3.5.1',
    },
  });

  api.render('./template', {
    ...rootOptions,
    ...options,
  });

  // late invoke compat
  if (invoking) {
    if (!api.hasPlugin('typescript')) {
      console.error(
        'Cannot add @coveo/vue-cli-plugin-typescript in a non-typescript project. You should add the @vue/cli-plugin-typescript plugin first'
      );
      return;
    }
  }
};
