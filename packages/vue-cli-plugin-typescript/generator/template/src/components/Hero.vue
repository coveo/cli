<template>
  <div class="hello my-6">
    <img alt="Vue logo" src="../assets/logo.png" />
    <h1 class="is-size-3">{{ msg }}</h1>
    <p>
      This sample search page was built with
      <a
        href="https://buefy.org"
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
      You can modify this sample by modifying styles with
      <code>./src/styles/_variables.scss</code>
      and components with
      <code>./src/components/**</code>
    </p>
    <h3>Installed CLI Plugins</h3>
    <ul>
      <li>
        <a
          href="https://www.npmjs.com/package/@vue/cli-plugin-babel"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >@vue/cli-plugin-babel</a
        >
      </li>
      <li>
        <a
          href="https://www.npmjs.com/package/@vue/cli-plugin-typescript"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >@vue/cli-plugin-typescript</a
        >
      </li>
      <li>
        <a
          href="https://www.npmjs.com/package/@vue/cli-plugin-eslint"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >@vue/cli-plugin-es-lint</a
        >
      </li>
      <li>
        <a
          href="https://www.npmjs.com/package/@coveo/vue-cli-plugin-typescript"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >@coveo/vue-cli-plugin-typescript</a
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
          >Coveo Headless documentation</a
        >
      </li>
      <li>
        <a
          href="https://vuejs.org"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >Vue.js documentation</a
        >
      </li>
      <li>
        <a
          href="https://buefy.org/documentation"
          target="_blank"
          rel="noopener"
          class="has-text-blue-accent"
          >Buefy documentation</a
        >
      </li>
    </ul>
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
