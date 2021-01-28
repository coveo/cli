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
      <div
        class="mb-6 py-2"
        v-for="result in state.results"
        :key="result.uniqueId"
      >
        <div class="is-size-5 mb-2">
          <a :href="result.clickUri">{{ result.title }}</a>
        </div>
        <p>{{ result.excerpt }}</p>
        <div class="columns">
          <div
            v-if="result.raw.author"
            class="mt-2 is-size-7 has-text-grey column is-narrow"
          >
            <b>Author</b> {{ result.raw.author }}
          </div>
          <div
            v-if="result.raw.objecttype"
            class="mt-2 is-size-7 has-text-grey column is-narrow"
          >
            <b>Object Type</b> {{ result.raw.objecttype }}
          </div>
          <div
            v-if="result.raw.filetype"
            class="mt-2 is-size-7 has-text-grey column is-narrow"
          >
            <b>File Type</b> {{ result.raw.filetype }}
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<script>
import engine from '../Engine';
import {buildResultList, FieldActions} from '@coveo/headless';
export default {
  name: 'ResultList',
  data: function () {
    return {
      state: {},
    };
  },
  created: function () {
    const fieldsToLoad = ['objecttype', 'filetype', 'author'];
    engine.dispatch(FieldActions.registerFieldsToInclude(fieldsToLoad));

    this.resultList = buildResultList(engine);
    this.resultList.subscribe(() => {
      this.state = {...this.resultList.state};
    });
  },
};
</script>
