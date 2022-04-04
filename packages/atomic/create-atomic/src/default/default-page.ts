import {IManifestResponse} from '@coveord/platform-client';
import {defaultLayout} from './default-layout.js';
import defaultResultTemplate from './default-result-template.js';
import defaultSearchInterface from './default-search-interface.js';

export const defaultPageManifest: IManifestResponse = {
  config: {
    title: 'Atomic Stencil Project',
  },
  markup: defaultSearchInterface,
  results: {
    attributes: {},
    templates: [{markup: defaultResultTemplate, attributes: {}}],
  },
  style: {
    theme: '',
    layout: defaultLayout,
  },
};
