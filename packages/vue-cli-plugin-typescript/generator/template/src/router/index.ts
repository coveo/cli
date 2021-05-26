import Vue from 'vue';
import VueRouter, {RouteConfig, Route, NavigationGuardNext} from 'vue-router';
import Home from '../views/Home.vue';
import Error from '../views/Error.vue';
import {getEngine} from '@/EngineService';
import {getTokenEndpoint, isEnvValid} from '@/utils/envUtils';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/error',
    name: 'Error',
    component: Error,
  },
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: async (
      _to: Route,
      _from: Route,
      next: NavigationGuardNext<Vue>
    ) => {
      if (!isEnvValid(process.env)) {
        next('/error');
      } else {
        const res = await fetch(getTokenEndpoint());
        const {token} = await res.json();
        // Adding Coveo Headless engine as a global mixin so it can be available to all components
        const engine = getEngine(token);
        Vue.mixin({
          beforeCreate: function () {
            this.$root.$data.$engine = engine;
          },
        });
        next();
      }
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
