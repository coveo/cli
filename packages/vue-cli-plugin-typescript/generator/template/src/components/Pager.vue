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
import {buildPager} from '@coveo/headless';
export default {
  name: 'Pager',
  data: function () {
    return {state: {}};
  },
  methods: {
    onChange: function (n) {
      this.pager.selectPage(n);
    },
  },
  created: function () {
    this.pager = buildPager(this.engine);
    this.pager.subscribe(() => {
      this.state = {
        ...this.pager.state,
        total: this.engine.state.search.response.totalCountFiltered,
      };
    });
  },
};
</script>
