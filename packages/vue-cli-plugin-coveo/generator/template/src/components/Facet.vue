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
<script>
import {buildFacet} from '@coveo/headless';
import FacetValue from './FacetValue';
import engine from '../Engine';

export default {
  name: 'Facet',
  props: ['field', 'title'],
  components: {FacetValue},
  data: function () {
    return {
      state: {},
    };
  },
  methods: {
    onToggle: function (facetValue) {
      this.facet.toggleSelect(facetValue);
    },
  },
  created: function () {
    this.facet = buildFacet(engine, {
      options: {field: this.field, title: this.title},
    });
    this.facet.subscribe(() => {
      this.state = {...this.facet.state};
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
