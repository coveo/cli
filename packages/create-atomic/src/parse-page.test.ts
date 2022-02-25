import {parsePageDownload, ParsedPageDownload} from './parse-page';

describe('parsePageDownload', () => {
  it('parses page downloads correctly', () => {
    const html = `<style>:root {--atomic-primary: red;--atomic-neutral: blue;}</style>
    <atomic-search-interface><atomic-search-box></atomic-search-box><atomic-result-list></atomic-result-list></atomic-search-interface>`;

    const expected: ParsedPageDownload = {
      style: ':root {--atomic-primary: red;--atomic-neutral: blue;}',
      markup: `<atomic-search-interface><atomic-search-box></atomic-search-box><results-manager></results-manager></atomic-search-interface>`,
      results: '<atomic-result-list></atomic-result-list>',
    };
    expect(expected).toEqual(parsePageDownload({html}));
  });
});
