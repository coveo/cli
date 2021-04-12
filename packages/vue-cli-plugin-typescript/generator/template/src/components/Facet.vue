<template>
  <div class="mb-5">
    <p class="is-size-5 mb-4">{{ this.title }}</p>
    <div class="content">
      <ul v-on:toggle="onToggle">
        <FacetValue
          @toggle="onToggle"
          v-for="v in state.values"
          v-bind:key="v.value"
          v-bind:facetValue="v"
        />
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import {buildFacet} from '@coveo/headless';
import type {
  Facet,
  FacetState,
  FacetValue as HeadlessFacetValue,
} from '@coveo/headless';
import FacetValue from './FacetValue.vue';

export interface IFacet {
  state: FacetState;
  facet: Facet;
}

export default Vue.extend({
  name: 'Facet',
  props: {
    field: String,
    title: String,
  },
  components: {FacetValue},
  data: function () {
    return {
      state: {},
    } as IFacet;
  },
  methods: {
    onToggle: function (facetValue: HeadlessFacetValue) {
      this.facet.toggleSelect(facetValue);
    },
  },
  created: function () {
    this.facet = buildFacet(this.engine, {
      options: {field: this.field, facetId: this.field},
    });
    this.facet.subscribe(() => {
      this.state = {...this.facet.state};
    });
  },
});
</script>
<style scoped>
.content ul {
  list-style-type: none;
  margin: 0;
}
</style>
