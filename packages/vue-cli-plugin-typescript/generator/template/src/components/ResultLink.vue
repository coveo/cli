<template>
  <a
    @click="onSelect"
    @contextmenu="onSelect"
    @mousedown="onSelect"
    @mouseup="onSelect"
    @touchstart="beginDelayedSelect"
    @touchend="cancelPendingSelect"
    :href="filteredUri"
    >{{ this.result.title }}</a
  >
</template>

<script lang="ts">
import Vue from 'vue';
import {buildInteractiveResult, Result} from '@coveo/headless';

export default Vue.extend({
  name: 'ResultLink',
  props: ['result'],
  data: function () {
    const interactiveResult = buildInteractiveResult(this.$root.$data.$engine, {
      options: {result: this.result as Result},
    });

    return {
      interactiveResult,
    };
  },
  computed: {
    filteredUri: function () {
      const uri = this.result.clickUri;
      // Filters out dangerous URIs that can create XSS attacks such as `javascript:`.
      const isAbsolute = /^(https?|ftp|file|mailto|tel):/i.test(uri);
      const isRelative = /^(\/|\.\/|\.\.\/)/.test(uri);
      return isAbsolute || isRelative ? uri : '';
    },
  },
  methods: {
    onSelect: function () {
      this.interactiveResult.select();
    },
    beginDelayedSelect: function () {
      this.interactiveResult.beginDelayedSelect();
    },
    cancelPendingSelect: function () {
      this.interactiveResult.cancelPendingSelect();
    },
  },
});
</script>
