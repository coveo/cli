import {PageDownload} from '../fetch-page';

export const html: PageDownload = {
  html: `<atomic-search-interface id="search">
<atomic-search-box class="search-box-item"></atomic-search-box>
<atomic-facet-manager><atomic-facet field="source" label="Source"></atomic-facet><atomic-facet field="filetype" label="Filetype"></atomic-facet></atomic-facet-manager>
<atomic-breadbox></atomic-breadbox>
<div class="topbar">
  <atomic-query-summary></atomic-query-summary>
  <atomic-refine-toggle></atomic-refine-toggle>
  <atomic-sort-dropdown><atomic-sort-expression label="Relevance" expression="relevancy"/><atomic-sort-expression label="Most recent" expression="date descending"/></atomic-sort-dropdown>
</div>
<div class="results">
  <atomic-did-you-mean></atomic-did-you-mean>
  <atomic-result-list display="list" density="comfortable">

    <atomic-result-template>
      <template>
        <style>
          .field {
            display: inline-flex;
            white-space: nowrap;
            align-items: center;
          }

          .field-label {
            font-weight: bold;
            margin-right: 0.25rem;
          }
        </style>
        <atomic-result-section-visual>
          <atomic-result-icon class="icon"></atomic-result-icon>
        </atomic-result-section-visual>
        <atomic-result-section-badges>
        </atomic-result-section-badges>
        <atomic-result-section-title><atomic-result-link></atomic-result-link></atomic-result-section-title>
        <atomic-result-section-title-metadata>
        </atomic-result-section-title-metadata>
        <atomic-result-section-excerpt
        ><atomic-result-text field="excerpt"></atomic-result-text
        ></atomic-result-section-excerpt>
        <atomic-result-section-bottom-metadata>
          <atomic-result-fields-list>
            <atomic-field-condition class="field" if-defined="author">
              <span class="field-label"><atomic-text value="author"></atomic-text>:</span>
              <atomic-result-text field="author"></atomic-result-text>
            </atomic-field-condition>

            <atomic-field-condition class="field" if-defined="source">
              <span class="field-label"><atomic-text value="source"></atomic-text>:</span>
              <atomic-result-text field="source"></atomic-result-text>
            </atomic-field-condition>

            <atomic-field-condition class="field" if-defined="language">
              <span class="field-label"><atomic-text value="language"></atomic-text>:</span>
              <atomic-result-multi-value-text field="language"></atomic-result-multi-value-text>
            </atomic-field-condition>

            <atomic-field-condition class="field" if-defined="filetype">
              <span class="field-label"><atomic-text value="fileType"></atomic-text>:</span>
              <atomic-result-text field="filetype"></atomic-result-text>
            </atomic-field-condition>

            <span class="field">
                  <span class="field-label">Date:</span>
                  <atomic-result-date></atomic-result-date>
                </span>
          </atomic-result-fields-list>
        </atomic-result-section-bottom-metadata>
      </template>
    </atomic-result-template>
  </atomic-result-list>
</div>
<div class="pagination">
  <atomic-load-more-results></atomic-load-more-results>
</div>
<div class="status">
  <atomic-query-error></atomic-query-error>
  <atomic-no-results></atomic-no-results>
</div>
</atomic-search-interface>`,
};
