import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/pages/Login.vue";
import Home from "../views/pages/Home.vue";
import GetItem from "../views/pages/GetItem.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/get-item", component: GetItem } 
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;