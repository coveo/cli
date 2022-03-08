import {Config} from '@stencil/core';
import dotenvPlugin from 'rollup-plugin-dotenv';
import html from 'rollup-plugin-html';

// https://stenciljs.com/docs/config

export const config: Config = {
  globalStyle: 'src/style/index.css',
  taskQueue: 'async',
  outputTargets: [
    {
      type: 'www',
      serviceWorker: null, // disable service workers
      copy: [{src: 'pages', keepDirStructure: false}],
    },
  ],
  devServer: {
    port: parseInt(process.env.STENCIL_PORT) || 3333,
  },
  plugins: [dotenvPlugin()],
  rollupPlugins: {
    before: [
      html({
        include: 'src/components/**/*.html',
      }),
    ],
  },
};
