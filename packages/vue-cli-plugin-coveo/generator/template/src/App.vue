<template>
  <div id="app">
    <div class="hero is-primary is-medium">
      <Hero msg="Welcome to Your Coveo Vue.js Search Page" />
    </div>
    <SearchPage />
  </div>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';
import Hero from './components/Hero.vue';
import SearchPage from './components/SearchPage.vue';

@Component({
  components: {
    Hero,
    SearchPage,
  },
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: $family-primary;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $primary !important;
}
</style>
