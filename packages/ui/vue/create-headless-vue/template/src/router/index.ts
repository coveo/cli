import HomeViewVue from "../views/HomeView.vue";
import ErrorViewVue from "../views/ErrorView.vue";
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/error",
    name: "Error",
    component: ErrorViewVue,
  },
  {
    path: "/",
    name: "Home",
    component: HomeViewVue,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
