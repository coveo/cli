import {Component, h} from '@stencil/core';
import blogTemplate from './templates/blog-template.html';
import youtubeTemplate from './templates/youtube-template.html';
import chatterTemplate from './templates/chatter-template.html';

import defaultTemplate from './templates/default-template.html';

/**
 * Component used to manage results & result templates.
 * See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/
 */
@Component({
  tag: 'results-manager',
  // styleUrl: "./results-manager.css",
  /* TODO: Add variables for result templates in CSS file */
  shadow: true,
})
export class ResultsManager {
  public render() {
    return (
      <atomic-folded-result-list display="list" image-size="small">
        <atomic-result-template must-match-source="Youtube">
          <template innerHTML={youtubeTemplate}></template>
        </atomic-result-template>
        <atomic-result-template must-match-source="Sports - Blog">
          <template innerHTML={blogTemplate}></template>
        </atomic-result-template>
        <atomic-result-template must-match-source="Chatter">
          <template innerHTML={chatterTemplate}></template>
        </atomic-result-template>
        <atomic-result-template>
          <template innerHTML={defaultTemplate}></template>
        </atomic-result-template>
      </atomic-folded-result-list>
    );
  }
}
