<template>
  <v-pagination
    :value="currentPage"
    :length="maxPage"
    :total-visible="7"
    @update:modelValue="onChange"
  />
</template>
<script lang="ts">
import { inject, reactive, computed } from "vue";
import { buildPager, type SearchEngine } from "@coveo/headless";
import { HeadlessInjectionKey } from "@/headlessKey";

let engine: SearchEngine;
export default {
  name: "CoveoPager",
  async setup() {
    engine = engine ?? (await inject(HeadlessInjectionKey)!);
  },
  data() {
    const pager = buildPager(engine);
    const stateRef = reactive({ state: pager.state });

    return {
      pager,
      stateRef,
      currentPage: computed(() => stateRef.state.currentPage),
      maxPage: computed(() => stateRef.state.maxPage),
    };
  },
  created() {
    this.pager.subscribe(() => {
      this.stateRef.state = { ...this.pager.state };
    });
  },
  methods: {
    onChange: function (n: number) {
      this.pager.selectPage(n);
    },
  },
};
</script>
