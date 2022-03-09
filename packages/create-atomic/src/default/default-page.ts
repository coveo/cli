import {PageManifest} from '../page-manifest.js';
import defaultResultTemplate from './default-result-template.js';
import defaultSearchInterface from './default-search-interface.js';

export const defaultPageManifest: PageManifest = {
  config: {
    title: 'Atomic Stencil Project',
  },
  markup: defaultSearchInterface,
  results: {
    placeholder: '',
    attributes: {},
    templates: [{markup: defaultResultTemplate, attributes: {}}],
  },
  style: {
    theme: '',
    layout: '',
  },
};
