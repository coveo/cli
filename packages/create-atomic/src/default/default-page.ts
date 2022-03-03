import {PageDownload} from '../fetch-page.js';
import defaultResultTemplate from './default-result-template.js';
import defaultSearchInterface from './default-search-interface.js';

export const defaultPageDownload: PageDownload = {
  config: {
    title: 'Atomic Stencil Project',
  },
  html: {
    resultListAttributes: '',
    style: '',
    resultTemplates: [
      {
        attributes: '',
        content: defaultResultTemplate,
      },
    ],
    searchInterface: defaultSearchInterface,
  },
};
