import {PageDownload} from './fetch-page';

export function customizePageDownload(
  pageDownload: PageDownload
): PageDownload {
  const resultManagerComponent = '<results-manager></results-manager>';
  const resultListPlaceholder = '<!--result-list-->';
  pageDownload.html.searchInterface = pageDownload.html.searchInterface.replace(
    resultListPlaceholder,
    resultManagerComponent
  );

  return pageDownload;
}
