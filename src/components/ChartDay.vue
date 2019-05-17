<template>
  <div class="graph" v-if="graph_data.length">
    <line-example :chart_data="chart_data" foo="bar"></line-example>
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
  graph_data: any = [];

  get chart_data() {
    if (!this.graph_data.length) return [];

    const chart = [];
    const labels = [];
    const ls_counts = [],
      ds_counts = [];

    const getHour = (elem: any) => {
      return new Date(Date.parse(elem.created_ts)).getHours();
    };

    let currentHour = null;

    for (const record of this.graph_data) {
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
    console.log(d);
    return d;
  }

  async mounted() {
    const resp = await axios.get(
      //"https://writtenrealms.com:9000/api/v1/wot/who/chart/?format=json"
      "http://localhost:8000/api/v1/wot/who/chart/?format=json"
    );
    this.graph_data = resp.data;
  }
}
</script>

<style lang='scss' scoped>
.graph {
  margin-top: 50px;
}
</style>