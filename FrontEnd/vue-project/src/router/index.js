import { createRouter, createWebHistory } from "vue-router";

import Login from "../views/pages/Login.vue";
import Home from "../views/pages/Home.vue";
import GetItem from "../views/pages/GetItem.vue";
import Register from "../views/pages/Register.vue";
import CreateItem from "../views/pages/CreateItem.vue";
import Logout from "../views/pages/Logout.vue";
import ItemQuestions from "../views/pages/ItemQuestions.vue";
import Questions from "../views/pages/Questions.vue";
import MyItems from "../views/pages/MyItems.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/create-item", component: CreateItem },
  { path: "/logout", component: Logout },
  { path: "/get-item", component: GetItem },
  { path: "/questions", component: Questions },
  { path: "/my-items", component: MyItems },
  { path: "/item/:itemId/questions", component: ItemQuestions }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;