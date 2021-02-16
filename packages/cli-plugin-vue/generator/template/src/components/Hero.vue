<template>
  <div class="hello my-6">
    <img alt="Vue logo" src="../assets/logo.png" />
    <h1 class="is-size-3">{{ msg }}</h1>
    <p>
      This sample search page was built with
      <a
        href="https://buefy.org/documentation"
        target="_blank"
        rel="noopener"
        class="has-text-blue-accent"
        >Buefy</a
      >
      and the
      <a
        href="https://docs.coveo.com/en/headless/"
        target="_blank"
        rel="noopener"
        class="has-text-blue-accent"
        >Coveo Headless Library</a
      >.
    </p>
    <p>
      You can set your variables with Sass by modifying
      <code>./src/styles/_variables.scss</code>
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >babel</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-typescript"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >typescript</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >eslint</a
        >
      </li>
      <li>
        <a
          href="https://github.com/coveo/cli/packages/vue-cli-plugin-coveo"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >vue-cli-plugin-coveo</a
        >
      </li>
    </ul>
    <h3>Essential Links</h3>
    <ul>
      <li>
        <a
          href="https://docs.coveo.com/en/headless"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >Coveo Connect</a
        >
      </li>
      <!-- <li>
        <a
          href="https://connect.coveo.com/"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >Coveo Headless Library</a
        >
      </li> -->
      <li>
        <a
          href="https://vuejs.org"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >Vue.js Core Docs</a
        >
      </li>
      <!-- <li>
        <a
          href="https://buefy.org/documentation"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >Buefy</a
        >
      </li> -->
    </ul>
    <!-- <h3>Ecosystem</h3> -->
    <!-- <ul>
      <li>
        <a href="https://router.vuejs.org" target="_blank" rel="noopener"
          >vue-router</a
        >
      </li>
      <li>
        <a href="https://vuex.vuejs.org" target="_blank" rel="noopener">vuex</a>
      </li>
      <li>
        <a
          href="https://github.com/vuejs/vue-devtools#vue-devtools"
          target="_blank"
          rel="noopener"
          >vue-devtools</a
        >
      </li>
      <li>
        <a href="https://vue-loader.vuejs.org" target="_blank" rel="noopener"
          >vue-loader</a
        >
      </li>
      <li>
        <a
          href="https://github.com/vuejs/awesome-vue"
          target="_blank"
          rel="noopener"
          >awesome-vue</a
        >
      </li>
    </ul> -->
  </div>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component
export default class Hero extends Vue {
  @Prop() private msg!: string;
}
</script>

<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
</style>
