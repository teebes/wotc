<template>
  <div id="players-online" v-if="snapshots.length">
    <div class="count">{{ ls_count }} Light Side - {{ ds_count }} Dark Side</div>

    <!-- <ChartDay :snapshots="snapshots"/> -->
    <div class="graph">
      <line-chart :chart_data="chart_data" v-if="snapshots.length"></line-chart>
    </div>
  </div>
  <div id="players-online" v-else>Loading...</div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import axios from "axios";
import LineChart from "@/components/LineChart.js";

@Component({
  components: {
    LineChart
  }
})
export default class extends Vue {
  ls_count: number = 0;
  ds_count: number = 0;
  timeout: any = null;
  snapshots: any = [];

  async mounted() {
    await this.updateCount();
    this.timeout = setInterval(() => {
      this.updateCount();
    }, 10000);
  }

  destroyed() {
    clearInterval(this.timeout);
  }

  async updateCount() {
    const resp = await axios(
      "https://writtenrealms.com:9000/api/v1/wot/who/chart/?format=json"
    );
    this.snapshots = resp.data;

    if (resp.status == 200) {
      this.ls_count = this.snapshots[0].ls_count;
      this.ds_count = this.snapshots[0].ds_count;
    }
  }

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

      if (currentHour !== null && currentHour === hour) {
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
