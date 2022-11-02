<script lang="ts">
import { inject, computed, reactive } from "vue";
import { buildFacet, type SearchEngine } from "@coveo/headless";

import type { FacetValue as HeadlessFacetValue } from "@coveo/headless";
import CoveoFacetValue from "./FacetValue.vue";
import { z } from "zod";
import { HeadlessInjectionKey } from "@/headlessKey";

const FacetProps = z.object({
  field: z.string(),
  title: z.string(),
});
let engine: SearchEngine;
export default {
  name: "CoveoFacet",
  facet: undefined,
  stateRef: undefined,
  props: {
    field: String,
    title: String,
  },
  components: {
    CoveoFacetValue,
  },
  async setup() {
    engine =
      engine ?? (await inject<Promise<SearchEngine>>(HeadlessInjectionKey)!);
  },
  data() {
    const parsedProps = FacetProps.parse(this.$props);
    const facet = buildFacet(engine!, {
      options: { field: parsedProps.field, facetId: parsedProps.field },
    });
    const stateRef = reactive({ state: facet.state });

    return {
      facet,
      stateRef,
      facetValues: computed(() => stateRef.state.values),
    };
  },

  methods: {
    onToggle: function (facetValue: HeadlessFacetValue) {
      this.facet.toggleSelect(facetValue);
    },
  },

  created() {
    this.facet.subscribe(() => {
      this.stateRef.state = { ...this.facet.state };
    });
  },
};
</script>
<style scoped>
.content ul {
  list-style-type: none;
  margin: 0;
}
</style>
<template>
  <v-expansion-panel>
    <v-expansion-panel-title>
      <template v-slot:default>
        {{ title }}
      </template>
    </v-expansion-panel-title>
    <v-expansion-panel-text>
      <CoveoFacetValue
        @toggle="onToggle"
        v-for="v in facetValues"
        :key="v.value"
        :facetValue="v"
      />
    </v-expansion-panel-text>
  </v-expansion-panel>
</template>
