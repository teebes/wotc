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

    get endpoint() {
        return "https://api.writtenrealms.com/api/v1/wot/who/chart/?format=json&view=yearly";
    }

    getLabel(elem: any) {
        const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
      ];
      const month = months[new Date(Date.parse(elem.created_ts)).getMonth()];
      return month;
    }
}
</script>
