<template>
  <div id="players-online">
    <h1>Players Online</h1>

    <div class="chart-nav nav">
      <router-link to="/who/daily">Daily</router-link>
      <router-link to="/who/weekly">Weekly</router-link>
      <router-link to="/who/monthly">Monthly</router-link>
    </div>

    <!-- <DailyView/> -->
    <router-view/>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import axios from "axios";
import DailyView from "@/components/DailyView.vue";

@Component({
  components: {
    DailyView
  }
})
export default class Who extends Vue {}
</script>

<style lang='scss'>
#players-online {
  margin: 0 auto;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;

  // .count {
  //   margin-top: 10px;
  // }

  .graph {
    margin-top: 20px;
  }
}
</style>