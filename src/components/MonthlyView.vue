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
export default class MonthlyView extends Vue {
  get endpoint() {
      return "https://api.writtenrealms.com/api/v1/wot/who/chart/?format=json&view=monthly";
  }

  getLabel = (elem: any) => {
    return new Date(Date.parse(elem.created_ts)).getDate();
  };
}
</script>
