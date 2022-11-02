<template>
  <a
    @click="onSelect"
    @contextmenu="onSelect"
    @mousedown="onSelect"
    @mouseup="onSelect"
    @touchstart="beginDelayedSelect"
    @touchend="cancelPendingSelect"
    :href="filteredUri"
    >{{ result.title }}</a
  >
</template>

<script lang="ts">
import { computed, inject } from "vue";
import {
  buildInteractiveResult,
  type Result,
  type SearchEngine,
} from "@coveo/headless";
import { HeadlessInjectionKey } from "@/headlessKey";

let engine: SearchEngine;
export default {
  name: "ResultLink",
  props: {
    result: {
      type: Object,
      required: true,
    },
  },
  async setup() {
    engine = engine ?? (await inject(HeadlessInjectionKey)!);
  },
  data() {
    const interactiveResult = buildInteractiveResult(engine, {
      options: { result: this.$props.result as Result },
    });
    return {
      interactiveResult,
      filteredUri: computed(() => {
        const uri = this.result.clickUri;
        // Filters out dangerous URIs that can create XSS attacks such as `javascript:`.
        const isAbsolute = /^(https?|ftp|file|mailto|tel):/i.test(uri);
        const isRelative = /^(\/|\.\/|\.\.\/)/.test(uri);
        return isAbsolute || isRelative ? uri : "";
      }),
    };
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
};
</script>
