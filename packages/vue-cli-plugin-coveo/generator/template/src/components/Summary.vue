<template>
  <section>
    <p v-if="summary.hasResults">
      Results {{ summary.firstResult }}-{{ summary.lastResult }} of {{ summary.total }} in {{ summary.durationInSeconds }} seconds
    </p>
    <p v-else>No results for {{ summary.query }}</p>
  </section>
</template>
<script>
import { buildQuerySummary } from '@coveo/headless';
import engine from '../Engine';
export default {
  name: 'Summary',
  data: function() {
    return {
      summary: {},
    };
  },
  created: function() {
    this.querySummary = buildQuerySummary(engine);
    this.querySummary.subscribe(() => {
      this.summary = { ...this.querySummary.state };
    });
  },
};
</script>
