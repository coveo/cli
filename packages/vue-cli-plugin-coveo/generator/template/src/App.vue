<template>
  <div id="app" class="has-text-left container">
    <link rel="stylesheet" href="https://cdn.materialdesignicons.com/5.3.45/css/materialdesignicons.min.css" />
    <section class="box my-3">
      <div class="columns">
        <div class="column is-four-fifths">
          <SearchBox />
        </div>
        <div class="column">
          <Facets />
        </div>
      </div>
      <Summary />
    </section>

    <section class="box my-3">
      <div class="columns">
        <div class="column">
          <ResultList />
        </div>
      </div>
    </section>
    <section class="box my-3">
      <div class="columns">
        <div class="column">
          <Pager />
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Vue from 'vue';
import Buefy from 'buefy';
import 'buefy/dist/buefy.css';
import 'material-design-icons';
import ResultList from './components/ResultList.vue';
import SearchBox from './components/SearchBox.vue';
import Facets from './components/Facets.vue';
import Summary from './components/Summary.vue';
import Pager from './components/Pager.vue';
import engine from './Engine';
import { AnalyticsActions, SearchActions } from '@coveo/headless';
Vue.use(Buefy);

export default {
  name: 'App',
  components: {
    ResultList,
    SearchBox,
    Facets,
    Summary,
    Pager,
  },
  mounted: function() {
    this.$nextTick(function() {
      engine.dispatch(SearchActions.executeSearch(AnalyticsActions.logInterfaceLoad()));
    });
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
