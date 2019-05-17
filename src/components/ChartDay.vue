<template>
  <div class="graph">
    <line-example :chart_data="chart_data" v-if="snapshots.length"></line-example>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import axios from "axios";
import LineExample from "@/components/LineChart.js";

@Component({
  components: {
    LineExample
  }
})
export default class extends Vue {
  @Prop() snapshots!: [];

  get chart_data() {
    if (!this.snapshots.length) return [];

    const chart = [];
    const labels = [];
    const ls_counts = [],
      ds_counts = [];

    const getHour = (elem: any) => {
      return new Date(Date.parse(elem.created_ts)).getHours();
    };

    let currentHour = null;

    for (const record of this.snapshots) {
      const hour = getHour(record);

      if (currentHour && currentHour === hour) {
        continue;
      }

      currentHour = hour;
      labels.push(hour);
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
.graph {
  margin-top: 50px;
}
</style>