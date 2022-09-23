<template>
  <b-autocomplete
    icon="magnify"
    placeholder="Search"
    :clearable="true"
    :data="suggestions"
    :open-on-focus="true"
    @typing="onTyping"
    @select="onSelect"
    @keydown.native="onKeyDown"
  ></b-autocomplete>
</template>

<script lang="ts">
import Vue from 'vue';
import {buildSearchBox, Suggestion} from '@coveo/headless';
import type {SearchBoxState, SearchBox} from '@coveo/headless';

export interface ISearchBox {
  state: SearchBoxState;
  searchBox: SearchBox;
}

export default Vue.extend({
  name: 'SearchBox',
  data: function () {
    const options = {
      numberOfSuggestions: 5,
    };
    const searchBox = buildSearchBox(this.$root.$data.$engine, {options});

    return {
      searchBox,
      state: {...searchBox.state},
    };
  },
  methods: {
    onTyping: function (v: string) {
      this.searchBox.updateText(v);
    },
    onSelect: function (v: string) {
      this.searchBox.selectSuggestion(v);
    },
    onKeyDown: function (e: KeyboardEvent) {
      if (e.key === 'Enter') {
        this.searchBox.submit();
      }
    },
  },
  computed: {
    suggestions: function (): string[] {
      return this.state.suggestions.map((s: Suggestion) => s.rawValue);
    },
  },
  created: function () {
    this.searchBox.subscribe(() => {
      this.state = {...this.searchBox.state};
    });
  },
});
</script>
