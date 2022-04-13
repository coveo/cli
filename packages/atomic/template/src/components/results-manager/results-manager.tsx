import {Component, h} from '@stencil/core';
import defaultTemplate from './default.html';

/**
 * Component used to manage results & result templates.
 * See https://docs.coveo.com/en/atomic/latest/usage/create-a-result-list/
 */
@Component({
  tag: 'results-manager',
  shadow: false,
})
export class ResultsManager {
  public render() {
    return (
      <atomic-result-list fields-to-include="">
        <atomic-result-template>
          <template dangerouslySetInnerHTML={defaultTemplate}></template>
        </atomic-result-template>
        {/*
        <atomic-result-template
        must-match-sourcetype="Salesforce">
          <template dangerouslySetInnerHTML={anotherTemplate}></template>
        </atomic-result-template>
        */}
      </atomic-result-list>
    );
  }
}
