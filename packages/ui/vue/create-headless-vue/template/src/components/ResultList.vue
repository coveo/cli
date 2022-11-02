<template>
  <section>
    <template v-if="state.isLoading">
      <div v-for="n in 5" class="my-5" :key="n">
        <p>Loading</p>
      </div>
    </template>
    <template v-else>
      <div
        class="mb-6 py-2"
        v-for="result in state.results"
        :key="result.uniqueId"
      >
        <div class="text-h5 mb-2">
          <ResultLink v-bind:result="result" />
        </div>
        <p>{{ result.excerpt }}</p>
        <div class="columns">
          <div
            v-if="result.raw.author"
            class="mt-2 text-body-1 has-text-grey column is-narrow"
          >
            <b>Author</b> {{ result.raw.author }}
          </div>
          <div
            v-if="result.raw.source"
            class="mt-2 text-body-1 has-text-grey column is-narrow"
          >
            <b>Source</b> {{ result.raw.source }}
          </div>
          <div
            v-if="result.raw.objecttype"
            class="mt-2 text-body-1 has-text-grey column is-narrow"
          >
            <b>Object Type</b> {{ result.raw.objecttype }}
          </div>
        </div>
      </div>
    </template>
  </section>
</template>
<script lang="ts">
import { inject } from "vue";
import ResultLink from "./ResultLink.vue";
import { buildResultList, type SearchEngine } from "@coveo/headless";
import { HeadlessInjectionKey } from "@/headlessKey";

let engine: SearchEngine;

export default {
  name: "ResultList",
  components: { ResultLink },
  async setup() {
    engine = engine ?? (await inject(HeadlessInjectionKey)!);
  },
  data() {
    const fieldsToInclude = ["objecttype", "filetype", "author"];
    const resultList = buildResultList(engine, {
      options: { fieldsToInclude },
    });
    return {
      resultList,
      state: resultList.state,
    };
  },
  created() {
    this.resultList.subscribe(() => {
      this.state = this.resultList.state;
    });
  },
};
</script>
