<template>
  <section>
    <b-button icon-left="filter-variant" @click="onClick">Filters</b-button>
    <b-sidebar type="is-light" :right="true" v-model="open" :fullheight="true" :fullwidth="false" :overlay="true">
      <div class="p-1 card">
        <Facet field="objecttype" title="Object Type" />
        <Facet field="filetype" title="File Type" />
        <Facet field="author" title="Author" />
      </div>
    </b-sidebar>
  </section>
</template>

<script>
import Facet from './Facet.vue';

export default {
  name: 'Facets',
  components: { Facet },
  data() {
    return {
      open: false,
    };
  },
  methods: {
    onClick: function() {
      this.open = true;
    },
  },
};
</script>
