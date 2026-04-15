const js = require('@eslint/js');
const prettier = require('eslint-config-prettier');
const globals = require('globals');
const tseslint = require('typescript-eslint');

const tsRules = {
  '@typescript-eslint/no-unused-vars': [
    'error',
    {ignoreRestSiblings: true, argsIgnorePattern: '^_'},
  ],
  '@typescript-eslint/explicit-member-accessibility': 'error',
  '@typescript-eslint/no-empty-object-type': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/no-unsafe-function-type': 'off',
  '@typescript-eslint/no-wrapper-object-types': 'off',
  '@typescript-eslint/prefer-for-of': 'error',
};

const jsRules = {
  'no-unused-vars': ['error', {argsIgnorePattern: '^_'}],
};

const cloneConfig = (config) => {
  const cloned = {...config};

  if (config.files) {
    cloned.files = [...config.files];
  }

  if (config.ignores) {
    cloned.ignores = [...config.ignores];
  }

  if (config.plugins) {
    cloned.plugins = {...config.plugins};
  }

  if (config.rules) {
    cloned.rules = {...config.rules};
  }

  if (config.languageOptions) {
    cloned.languageOptions = {...config.languageOptions};
  }

  if (config.languageOptions?.globals) {
    cloned.languageOptions.globals = {...config.languageOptions.globals};
  }

  if (config.languageOptions?.parserOptions) {
    cloned.languageOptions.parserOptions = {
      ...config.languageOptions.parserOptions,
    };
  }

  return cloned;
};

const withTsconfigRootDir = (config, tsconfigRootDir) => {
  const cloned = cloneConfig(config);

  if (!tsconfigRootDir) {
    return cloned;
  }

  cloned.languageOptions = {...(cloned.languageOptions ?? {})};
  cloned.languageOptions.parserOptions = {
    ...(cloned.languageOptions.parserOptions ?? {}),
    tsconfigRootDir,
  };

  return cloned;
};

const createLintConfig = ({
  ignores = [],
  extraConfigs = [],
  tsconfigRootDir,
} = {}) => {
  const typeScriptConfigs = tseslint.configs.recommended.map((config) =>
    withTsconfigRootDir(config, tsconfigRootDir)
  );

  return [
    {
      ignores: ['node_modules', ...ignores],
    },
    js.configs.recommended,
    prettier,
    {
      files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'],
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parserOptions: {
          ...(tsconfigRootDir ? {tsconfigRootDir} : {}),
        },
      },
    },
    {
      languageOptions: {
        globals: globals.jest,
      },
    },
    ...typeScriptConfigs,
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: {
        '@typescript-eslint': tseslint.plugin,
      },
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        parserOptions: {
          jsxPragma: 'h',
          ...(tsconfigRootDir ? {tsconfigRootDir} : {}),
        },
      },
      rules: tsRules,
    },
    {
      files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
      languageOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        globals: globals.node,
      },
      rules: {
        ...jsRules,
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['**/*.cjs'],
      languageOptions: {
        sourceType: 'commonjs',
        globals: globals.node,
      },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
      },
    },
    ...extraConfigs,
  ];
};

module.exports = {createLintConfig};
