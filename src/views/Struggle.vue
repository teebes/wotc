<template>
  <div id="struggle">
    <h1>Struggle</h1>

    <template v-if="loaded">
      <div>
        <div>Light Side: {{ current_ls }}</div>
        <div>Dark Side: {{ current_ds }}</div>
        <div>Seanchan Side: {{ current_ss }}</div>
      </div>

      <h2>Last Month</h2>

      <div>
        <div>Light Side: {{ last_month_ls }}</div>
        <div>Dark Side: {{ last_month_ds }}</div>
        <div>Seanchan Side: {{ last_month_ss }}</div>
      </div>
    </template>

  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import axios from "axios";

@Component({
  components: {}
})
export default class Who extends Vue {
  current_ls: number = 0;
  current_ds: number = 0;
  current_ss: number = 0;
  last_month_ls: number = 0;
  last_month_ds: number = 0;
  last_month_ss: number = 0;
  loaded: boolean = false;

  async mounted() {
    const resp = await axios.get(
      "https://api.writtenrealms.com/api/v1/wot/struggle/?format=json"
    );
    console.log(resp.data);
    this.current_ls = resp.data.current.ls;
    this.current_ds = resp.data.current.ds;
    this.current_ss = resp.data.current.ss;
    this.last_month_ls = resp.data.last_month.ls;
    this.last_month_ds = resp.data.last_month.ds;
    this.last_month_ss = resp.data.last_month.ss;
    this.loaded = true;
  }
}
</script>

<style lang='scss'>
#struggle {
  margin: 0 auto;
  margin-top: 30px;

  h1 {
    margin-bottom: 20px;
  }

  h2 {
    margin: 20px 0;
  }
}
</style>
