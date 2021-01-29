<template>
  <b-pagination
    :current="state.currentPage"
    :total="state.total"
    :per-page="10"
    :range-after="5"
    :range-before="5"
    @change="onChange"
  />
</template>
<script>
import { buildPager } from "@coveo/headless";
import engine from "../Engine";
export default {
  name: "Pager",
  data: function () {
    return { state: {} };
  },
  methods: {
    onChange: function (n) {
      this.pager.selectPage(n);
    },
  },
  created: function () {
    this.pager = buildPager(engine);
    this.pager.subscribe(() => {
      this.state = {
        ...this.pager.state,
        total: engine.state.search.response.totalCountFiltered,
      };
    });
  },
};
</script>