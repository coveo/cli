const js = require("@eslint/js");
const pluginVue = require("eslint-plugin-vue");
const prettier = require("@vue/eslint-config-prettier");
const {
  configureVueProject,
  defineConfigWithVueTs,
  vueTsConfigs,
} = require("@vue/eslint-config-typescript");

configureVueProject({
  rootDir: __dirname,
});

module.exports = defineConfigWithVueTs(
  {
    ignores: ["dist", "node_modules", ".eslintrc.cjs", "eslint.config.cjs"],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
  js.configs.recommended,
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,
  prettier,
);
