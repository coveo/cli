import {Config} from '@stencil/core';
import html from 'rollup-plugin-html';
export const config: Config = {
  namespace: 'my-custom-components',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements',
    },
    {
      type: 'docs-readme',
    },
  ],
  rollupPlugins: {
    before: [
      html({
        include: './**/*.html',
      }),
    ],
  },
};
