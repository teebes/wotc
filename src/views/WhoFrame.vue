<template>
  <div class="who-frame">
    <DailyView/>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import DailyView from "@/components/DailyView.vue";

@Component({
  components: {
    DailyView
  }
})
export default class WhoFrame extends Vue {
  mounted() {
    this.$store.commit("hide_frame");
    this.$store.commit("blue_color_set", "32, 132, 196");
  }

  destroyed() {
    this.$store.commit("show_frame");
  }
}
</script>

<style lang='scss'>
.who-frame {
  canvas {
    width: 312px !important;
    height: 312px !important;
  }
}
</style>