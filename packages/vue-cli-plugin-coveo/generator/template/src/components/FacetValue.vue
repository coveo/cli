<template>
  <li>
    <b-checkbox
      :native-value="facetValue.state === 'selected'"
      @change.native="onChange"
    >{{facetValue.value}} ( {{facetValue.numberOfResults}} )</b-checkbox>
  </li>
</template>
<script>
export default {
  name: "FacetValue",
  props: ["facetValue"],
  methods: {
    onChange: function () {
      this.$emit("toggle", this.facetValue);
    },
  },
};
</script>
<style scoped>
li {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style> >