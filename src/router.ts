import Vue from "vue";
import Router from "vue-router";
import Bash from "@/views/Bash.vue";
import Stab from "@/views/Stab.vue";
import Charge from "@/views/Charge.vue";
import Kick from "@/views/Kick.vue";
import Who from "@/views/Who.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      //alias: "/bash",
      name: "home",
      redirect: "bash"
    },
    {
      path: "/bash",
      name: "bash",
      component: Bash
    },
    {
      path: "/stab",
      name: "stab",
      component: Stab
    },
    {
      path: "/charge",
      name: "charge",
      component: Charge
    },
    {
      path: "/kick",
      name: "kick",
      component: Kick
    },
    {
      path: "/who",
      name: "who",
      component: Who
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
