<template>
  <DailyView/>
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
  }

  destroyed() {
    this.$store.commit("show_frame");
  }
}
</script>

<style lang='scss'>
</style>