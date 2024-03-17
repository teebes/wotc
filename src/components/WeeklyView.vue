<template>
  <TimeView :endpoint="endpoint" :getLabel="getLabel"/>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
import TimeView from "@/components/TimeView.vue"

@Component({
  components: {
    TimeView
  }
})
export default class extends Vue {
  snapshots: any = [];

  get endpoint() {
    return "https://api.writtenrealms.com/api/v1/wot/who/chart/?format=json&view=weekly";
  }

  getLabel = (elem: any) => {
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
}
</script>
