<template>
  <section>
    <p v-if="state.hasResults" class="has-text-weight-bold">
      Results {{ state.firstResult }}-{{ state.lastResult }} of
      {{ state.total }} in {{ state.durationInSeconds }} seconds
    </p>
    <p v-else>No results for {{ state.query }}</p>
  </section>
</template>
<script lang="ts">
import Vue from 'vue';
import {buildQuerySummary} from '@coveo/headless';
import type {QuerySummary, QuerySummaryState} from '@coveo/headless';

export interface ISummary {
  state: QuerySummaryState;
  querySummary: QuerySummary;
}
export default Vue.extend({
  name: 'Summary',
  data: function () {
    return {
      state: {},
    } as ISummary;
  },
  created: function () {
    this.querySummary = buildQuerySummary(this.engine);
    this.querySummary.subscribe(() => {
      this.state = {...this.querySummary.state};
    });
  },
});
</script>
