<template>
  <div id="search-page" class="has-text-left container">
    <link
      rel="stylesheet"
      href="https://cdn.materialdesignicons.com/5.3.45/css/materialdesignicons.min.css"
    />
    <section class="my-6">
      <div class="columns is-centered">
        <div class="column is-three-fifths">
          <SearchBox />
        </div>
      </div>
    </section>

    <section class="my-3">
      <div class="columns">
        <div class="column is-one-quarter">
          <Facets />
        </div>
        <div class="column is-two-quarters pl-5">
          <div class="column mb-5 p-0">
            <Summary />
          </div>
          <ResultList />
          <Pager />
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import ResultList from './ResultList.vue';
import SearchBox from './SearchBox.vue';
import Facets from './Facets.vue';
import Summary from './Summary.vue';
import Pager from './Pager.vue';
import {AnalyticsActions, SearchActions} from '@coveo/headless';
Vue.use(Buefy);

export default Vue.extend({
  name: 'searchPage',
  components: {
    ResultList,
    SearchBox,
    Facets,
    Summary,
    Pager,
  },
  mounted: function (): void {
    this.$nextTick(function () {
      this.$root.$data.$engine.dispatch(
        SearchActions.executeSearch(AnalyticsActions.logInterfaceLoad())
      );
    });
  },
});
</script>

<style scoped lang="scss"></style>
