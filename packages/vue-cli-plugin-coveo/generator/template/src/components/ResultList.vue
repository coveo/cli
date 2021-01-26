<template>
  <section>
    <template v-if="state.isLoading">
      <div v-for="n in 5" class="my-5" :key="n">
        <div class="my-1">
          <b-skeleton :animated="true"></b-skeleton>
        </div>
        <b-skeleton :animated="true"></b-skeleton>
        <b-skeleton :animated="true"></b-skeleton>
        <b-skeleton :animated="true" width="50%"></b-skeleton>
      </div>
    </template>
    <template v-else>
      <div class="my-5" v-for="result in state.results" :key="result.uniqueId">
        <div class="my-1">
          <a :href="result.clickUri">{{ result.title }}</a>
        </div>
        <p>{{ result.excerpt }}</p>
      </div>
    </template>
  </section>
</template>

<script>
import engine from '../Engine';
import { buildResultList } from '@coveo/headless';
export default {
  name: 'ResultList',
  data: function() {
    return {
      state: {},
    };
  },
  created: function() {
    this.resultList = buildResultList(engine);
    this.resultList.subscribe(() => {
      this.state = { ...this.resultList.state };
    });
  },
};
</script>
