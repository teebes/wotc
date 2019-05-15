<template>
  <div id="players-online">
    <h1>Players Online</h1>

    <div class="count">{{ ls_count }} Light Side - {{ ds_count }} Dark Side</div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import axios from "axios";

@Component
export default class extends Vue {
  ls_count: number = 0;
  ds_count: number = 0;
  timeout: any = null;

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
    const resp = await axios.get(
      "https://writtenrealms.com:9000/api/v1/wot/who/?format=json"
    );
    if (resp.status == 200) {
      this.ls_count = resp.data.ls_count;
      this.ds_count = resp.data.ds_count;
    }
  }
}
</script>

<style lang='scss' scoped>
#players-online {
  margin: 0 auto;
  margin-top: 30px;

  .count {
    margin-top: 50px;
  }
}
</style>