<script setup lang="ts">
// @ is an alias to /src
import SearchPage from "@/components/SearchPage.vue";
</script>
<template>
  <v-layout>
    <v-main>
      <v-container fluid>
        <Suspense>
          <SearchPage />
        </Suspense>
      </v-container>
    </v-main>
  </v-layout>
</template>
