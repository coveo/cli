<template>
  <div id="app">
    <div class="hero is-primary is-medium">
      <Hero msg="Welcome to Your Coveo Vue.js Search Page" />
    </div>
    <SearchPage />
  </div>
</template>

<script>
// @ is an alias to /src
import Hero from '@/components/Hero.vue';
import SearchPage from '@/components/SearchPage.vue';

export default {
  name: 'Home',
  components: {
    Hero,
    SearchPage,
  },
};
</script>

<style lang="scss">
@import '~@/styles/variables';
#app {
  font-family: $family-primary;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $primary !important;
}
</style>
