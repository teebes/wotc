import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import Bash from "@/views/Bash.vue";
import Stab from "@/views/Stab.vue";
import Playground from "./views/Playground.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      alias: "/bash",
      name: "home",
      component: Bash
    },
    // {
    //   path: "/bash",
    //   name: "bash",
    //   component: Bash
    // },
    {
      path: "/stab",
      name: "stab",
      component: Stab
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue")
    }
  ]
});
