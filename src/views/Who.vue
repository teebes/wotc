<template>
  <div id="players-online" v-if="snapshots.length">
    <h1>Players Online</h1>

    <div class="count">{{ ls_count }} Light Side - {{ ds_count }} Dark Side</div>

    <ChartDay :snapshots="snapshots"/>
  </div>
  <div id="players-online" v-else>Loading...</div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import axios from "axios";
import ChartDay from "@/components/ChartDay.vue";

@Component({
  components: {
    ChartDay
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
}
</script>

<style lang='scss' scoped>
#players-online {
  margin: 0 auto;
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .count {
    margin-top: 50px;
  }
}
</style>