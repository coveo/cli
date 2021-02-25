<template>
  <section class="hero is-warning is-fullheight">
    <div class="hero-body">
      <div class="container">
        <div class="column is-three-quarter">
          <p class="title mb-6">Invalid Environment variables</p>
          <p class="subtitle">
            You should have a valid <code>.env</code> file at the root of this
            project. You can use <code>.env.example</code> as starting point and
            make sure to replace all placeholder variables
            <code>&#60;...&#62;</code> by the proper information for your
            organization.
          </p>
          <p>Refer to the project <b>README</b> file for more information.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
// @ is an alias to /src
// import Hero from '@/components/Hero.vue';
// import SearchPage from '@/components/SearchPage.vue';

export default {
  name: 'Error',
  components: {},
};
</script>

<style lang="scss"></style>
