<template>
  <section>
    <!-- <b-button icon-left="filter-variant" @click="onClick">Filters</b-button> -->
    <h4 class="subtitle is-size-4 has-text-weight-bold">Refine By</h4>
    <div class="p-1">
      <Facet field="objecttype" title="Object Type" />
      <Facet field="filetype" title="File Type" />
      <Facet field="author" title="Author" />
    </div>
  </section>
</template>

<script>
import Facet from './Facet.vue';

export default {
  name: 'Facets',
  components: {Facet},
  data() {
    return {
      open: false,
    };
  },
  methods: {
    onClick: function () {
      this.open = true;
    },
  },
};
</script>
