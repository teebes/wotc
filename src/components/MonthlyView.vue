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
      return "https://writtenrealms.com:9000/api/v1/wot/who/chart/?format=json&view=yearly";
  }

  getLabel = (elem: any) => {
    return new Date(Date.parse(elem.created_ts)).getDate();
  };
}
</script>
