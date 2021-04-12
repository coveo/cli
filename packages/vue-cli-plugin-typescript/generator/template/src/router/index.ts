import Vue from 'vue';
import VueRouter, {RouteConfig, Route, NavigationGuardNext} from 'vue-router';
import Home from '../views/Home.vue';
import Error from '../views/Error.vue';
import {getEngine} from '@/EngineService';
import {isEnvValid} from '@/utils/envUtils';

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
      if (!isEnvValid()) {
        next('/error');
      } else {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const res = await fetch(process.env.VUE_APP_TOKEN_ENDPOINT!);
        const {token} = await res.json();
        // Adding Coveo Headless engine as a global mixin so it can be available to all components
        const engine = getEngine(token);
        Vue.mixin({
          data: () => ({
            engine: engine,
          }),
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
