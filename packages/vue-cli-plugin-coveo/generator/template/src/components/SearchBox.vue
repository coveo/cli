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

<script>
import engine from '../Engine';
import {buildSearchBox, SearchBoxOptions} from '@coveo/headless';

export default {
  name: 'SearchBox',
  data: function () {
    return {
      state: {},
    };
  },
  methods: {
    onTyping: function (v) {
      this.searchBox.updateText(v);
    },
    onSelect: function (v) {
      this.searchBox.selectSuggestion(v);
    },
    onKeyDown: function (e) {
      if (e.keyCode === 13) {
        this.searchBox.submit();
      }
    },
  },
  computed: {
    suggestions: function () {
      return this.state.suggestions.map((s) => s.rawValue);
    },
  },
  created: function () {
    const options = {
      numberOfSuggestions: 5,
    };
    this.searchBox = buildSearchBox(engine, {options});
    this.unsubscribe = this.searchBox.subscribe(() => {
      this.state = {...this.searchBox.state};
    });
  },
};
</script>
