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
<script lang="ts">
import Vue from 'vue';
import {buildPager} from '@coveo/headless';
import type {Pager, PagerState as HeadlessPagerState} from '@coveo/headless';

export interface PagerState extends HeadlessPagerState {
  total: number;
}
export interface IPager {
  state: PagerState;
  pager: Pager;
}

export default Vue.extend({
  name: 'Pager',
  data: function () {
    return {
      state: {},
    } as IPager;
  },
  methods: {
    onChange: function (n: number) {
      this.pager.selectPage(n);
    },
  },
  created: function () {
    const engine = this.engine;
    this.pager = buildPager(engine);
    this.pager.subscribe(() => {
      this.state = {
        ...this.pager.state,
        total: engine.state.search.response.totalCountFiltered,
      };
    });
  },
});
</script>
