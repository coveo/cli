import {PageDownload} from './fetch-page';

export interface ParsedPageDownload {
  style?: string;
  markup: string;
  results: string;
}

export function parsePageDownload({html}: PageDownload): ParsedPageDownload {
  const styleMatch = html.match(/<style>((.|\s)*?)<\/style>/);
  const style = styleMatch ? styleMatch[1] : undefined;
  const markupMatch = html.match(
    /<atomic-search-interface(.|\s)*?<\/atomic-search-interface>/
  );

  if (!markupMatch) {
    throw new Error(
      'Page markup does not contain an "atomic-search-interface" component. You might need to upgrade the Coveo CLI.'
    );
  }

  const markup = markupMatch[0];
  const resultsRegex = /<atomic-result-list(.|\s)*?<\/atomic-result-list>/;
  const resultsMatch = markup.match(resultsRegex);

  if (!resultsMatch) {
    throw new Error(
      'Page markup does not contain an "atomic-result-list" component. You might need to upgrade the Coveo CLI.'
    );
  }

  return {
    style,
    results: resultsMatch[0],
    markup: markup.replace(resultsRegex, '<results-manager></results-manager>'),
  };
}
