<script lang="ts">
import ResultList from "./ResultList.vue";
import SearchBox from "./SearchBox.vue";
import CoveoFacets from "./Facets.vue";
import SearchSummary from "./Summary.vue";
import CoveoPager from "./Pager.vue";
import { inject } from "vue";
import { buildResultsPerPage, type SearchEngine } from "@coveo/headless";
import { HeadlessInjectionKey } from "@/headlessKey";
export default {
  components: {
    ResultList,
    SearchBox,
    CoveoFacets,
    SearchSummary,
    CoveoPager,
  },
  async setup() {
    const engine: SearchEngine = await inject(HeadlessInjectionKey)!;
    buildResultsPerPage(engine, { initialState: { numberOfResults: 6 } });
    engine.executeFirstSearch();
  },
};
</script>
<template>
  <link
    rel="stylesheet"
    href="https://cdn.materialdesignicons.com/5.3.45/css/materialdesignicons.min.css"
  />
  <v-row>
    <v-col align-self="center">
      <SearchBox />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="3">
      <Suspense>
        <CoveoFacets />
      </Suspense>
    </v-col>
    <v-col col="6">
      <Suspense>
        <SearchSummary />
      </Suspense>
      <Suspense>
        <ResultList />
      </Suspense>
      <Suspense><CoveoPager /></Suspense>
    </v-col>
  </v-row>
</template>

<style scoped lang="scss"></style>
