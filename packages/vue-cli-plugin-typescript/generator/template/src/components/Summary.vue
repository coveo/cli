<template>
  <section>
    <p v-if="summary.hasResults" class="has-text-weight-bold">
      Results {{ summary.firstResult }}-{{ summary.lastResult }} of
      {{ summary.total }} in {{ summary.durationInSeconds }} seconds
    </p>
    <p v-else>No results for {{ summary.query }}</p>
  </section>
</template>
<script>
import {buildQuerySummary} from '@coveo/headless';
export default {
  name: 'Summary',
  data: function () {
    return {
      summary: {},
    };
  },
  created: function () {
    this.querySummary = buildQuerySummary(this.engine);
    this.querySummary.subscribe(() => {
      this.summary = {...this.querySummary.state};
    });
  },
};
</script>
