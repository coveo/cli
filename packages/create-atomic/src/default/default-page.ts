import {PageDownload} from '../fetch-page';
import defaultResultTemplate from './default-result-template.html';
import defaultSearchInterface from './default-search-interface.html';

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
