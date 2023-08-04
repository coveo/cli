<template>
  <v-checkbox
    v-model="checkbox"
    :label="label"
    class="facet-label"
    density="compact"
  >
  </v-checkbox>
</template>
<script lang="ts">
import { computed, watch, type Ref, toRef } from "vue";

let checkbox: Ref<boolean>;
export default {
  name: "CoveoFacetValue",
  props: {
    facetValue: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    checkbox = toRef(() => props.facetValue.state);
  },
  data() {
    watch(checkbox, () => this.$emit("toggle", this.$props.facetValue));
    return {
      checkbox,
      label: computed(
        () => `${this.facetValue.value} (${this.facetValue.numberOfResults})`
      ),
    };
  },
};
</script>
