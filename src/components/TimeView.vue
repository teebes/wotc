<template>
  <div id="players-online" v-if="snapshots.length">
    <div class="avg-max">
      <input type="radio" id="avg" value="avg" v-model="func">
      <label for="avg">Avg</label>

      <input type="radio" id="max" value="max" v-model="func">
      <label for="max">Max</label>

      <input type="radio" id="min" value="min" v-model="func">
      <label for="min">Min</label>
    </div>

    <div class="graph">
      <line-chart :chart_data="chart_data" v-if="snapshots.length" :key="ts"></line-chart>
    </div>
  </div>
  <div id="players-online" v-else>Loading...</div>
</template>

<script lang='ts'>
import { Component, Vue, Prop, Watch } from "vue-property-decorator";
import axios from "axios";
import LineChart from "@/components/LineChart.js";

@Component({
  components: {
    LineChart
  }
})
export default class extends Vue {
  @Prop() endpoint!: string;
  @Prop() getLabel!: any;

  ts: any = null;
  func: string = "max";
  snapshots: any = [];

  @Watch("func")
  async changeFunc(newfunc: any) {
    this.fetch();
    // const resp = await axios(this.endpoint + `&func=${newfunc}`);
    // this.snapshots = resp.data;
    // this.ts = new Date().getTime();
  }
  async fetch() {
    this.snapshots = [];
    const resp = await axios(this.endpoint + `&func=${this.func}`);
    this.snapshots = resp.data;
    this.ts = new Date().getTime();
  }

  async mounted() {
    this.fetch();
  }

  get chart_data() {
    if (!this.snapshots.length) return [];

    console.log(";here");

    const chart = [];
    const labels = [];
    const ls_counts = [],
      ds_counts = [];

    const getLabel = (elem: any) => {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];
      const dayOfWeek = days[new Date(Date.parse(elem.created_ts)).getDay()];
      return dayOfWeek.slice(0, 3);
    };

    for (const record of this.snapshots) {
      const ts_label = this.getLabel(record);

      labels.push(ts_label);
      ls_counts.push(record.ls_count);
      ds_counts.push(record.ds_count);
    }

    labels.reverse();
    ls_counts.reverse();
    ds_counts.reverse();

    const d = {
      labels: labels,
      datasets: [
        {
          label: "DS Count",
          backgroundColor: "#FC2525",
          data: ds_counts
        },
        {
          label: "LS Count",
          backgroundColor: "#05CBE1",
          data: ls_counts
        }
      ]
    };
    return d;
  }
}
</script>

<style lang='scss' scoped>
label {
  &:not(:last-child) {
    margin-right: 20px;
  }
}
</style>