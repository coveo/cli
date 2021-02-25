import Vue from 'vue';
import VueRouter, {RouteConfig, Route, NavigationGuardNext} from 'vue-router';
import Home from '../views/Home.vue';
import {EngineService} from '@/EngineService';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    beforeEnter: async (
      _to: Route,
      _from: Route,
      next: NavigationGuardNext<Vue>
    ) => {
      const res = await fetch(process.env.VUE_APP_TOKEN_ENDPOINT);
      const {token} = await res.json();
      const engineService = new EngineService(token);
      // Adding Coveo Headless engine as a global mixin so it can be available to all components
      Vue.mixin(engineService.mixin);
      next();
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
