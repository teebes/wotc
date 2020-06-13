import Vue from "vue";
import Router from "vue-router";
import Bash from "@/views/Bash.vue";
import Stab from "@/views/Stab.vue";
import Melee from "@/views/Melee.vue";
import Charge from "@/views/Charge.vue";
import Kick from "@/views/Kick.vue";
import Struggle from "@/views/Struggle.vue";
import Who from "@/views/Who.vue";
import WhoFrame from "@/views/WhoFrame.vue";
import DailyView from "@/components/DailyView.vue";
import WeeklyView from "@/components/WeeklyView.vue";
import MonthlyView from "@/components/MonthlyView.vue";
import YearlyView from "@/components/YearlyView.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      //alias: "/bash",
      name: "home",
      redirect: "bash",
    },
    {
      path: "/bash",
      name: "bash",
      component: Bash,
    },
    {
      path: "/stab",
      name: "stab",
      component: Stab,
    },
    {
      path: "/melee",
      name: "melee",
      component: Melee,
    },
    {
      path: "/charge",
      name: "charge",
      component: Charge,
    },
    {
      path: "/kick",
      name: "kick",
      component: Kick,
    },
    {
      path: "/struggle",
      name: "struggle",
      component: Struggle,
    },
    {
      path: "/who",
      name: "who",
      component: Who,
      redirect: "/who/daily",
      children: [
        {
          path: "daily",
          component: DailyView,
          name: "who_daily",
        },
        {
          path: "weekly",
          component: WeeklyView,
          name: "who_weekly",
        },
        {
          path: "monthly",
          component: MonthlyView,
          name: "who_monthly",
        },
        {
          path: "yearly",
          component: YearlyView,
          name: "who_yearly",
        },
      ],
    },
    {
      path: "/whoframe",
      name: "whoframe",
      component: WhoFrame,
    },
    {
      path: "/about",
      name: "about",
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () =>
        import(/* webpackChunkName: "about" */ "./views/About.vue"),
    },
  ],
});
