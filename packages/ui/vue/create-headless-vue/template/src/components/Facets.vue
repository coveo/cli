<template>
  <section>
    <v-row>
      <v-col cols="12">
        <h4 class="text-h5">Refine By</h4>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" class="p1">
        <v-expansion-panels>
          <CoveoFacet field="objecttype" title="Object Type" />
          <CoveoFacet field="filetype" title="File Type" />
          <CoveoFacet field="author" title="Author" />
        </v-expansion-panels>
      </v-col>
    </v-row>
  </section>
</template>

<script lang="ts">
import CoveoFacet from "./Facet.vue";

export default {
  name: "CoveoFacets",
  components: { CoveoFacet },
  data: function () {
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
