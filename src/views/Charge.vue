<template>
  <div class="playground-tool">
    <div class="results">
      <div class="inner">
        <h1>
          Charge Chance:
          <span class="color-primary">{{ charge_prob.toPrecision(2) }}</span>
        </h1>
      </div>
    </div>

    <div class="participants">
      <div class="attacker-info panel">
        <form @submit.prevent="submit" autocomplete="off">
          <h2>ATTACKER</h2>

          <div class="pair">
            <div class="form-group">
              <label for="field-attacker_charge">Charge</label>
              <input
                id="field-attacker_charge"
                v-model.number="attacker_charge"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <div class="form-group">
              <label for="field-attacker_level">Level</label>
              <input
                id="field-attacker_level"
                v-model.number="attacker_level"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="field_terrain">Terrain</label>
            <select id="field_terrain" v-model="terrain">
              <option
                v-for="option in terrain_options"
                :key="option.attr"
                :value="option.attr"
              >{{ option.label }}</option>
            </select>
          </div>

          <div class="form-group">
            <div class="is_riding form-group inline">
              <input id="field-is_flying" v-model="is_flying" type="checkbox">
              <label for="field-is_flying">Is flying</label>
            </div>
          </div>
        </form>
      </div>

      <div class="defender-info panel">
        <h2>DEFENDER</h2>

        <div class="form-group">
          <label for="field-victim_level">Level</label>
          <input
            id="field-victim_level"
            v-model.number="victim_level"
            inputmode="numeric"
            pattern="[0-9]*"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class extends Vue {
  attacker_level: number = 30;
  attacker_charge: number = 99;
  victim_level: number = 30;
  terrain: string = "road";
  is_flying: boolean = false;
  is_sleeping: boolean = false;

  terrain_options: Array<{ attr: string; label: string }> = [
    {
      attr: "road",
      label: "Road"
    },
    {
      attr: "forest",
      label: "Forest"
    },
    {
      attr: "hills",
      label: "Hills / Forest"
    },
    {
      attr: "mountain",
      label: "Mountain"
    }
  ];

  get charge_prob() {
    const level_diff =
      Math.min(30, this.attacker_level) - Math.min(30, this.victim_level);

    let prob: number = Math.trunc(
      (Math.max(0, 50 + 2 * level_diff) * this.attacker_charge) / 99
    );

    if (this.is_flying) {
      prob /= 2;
    } else {
      if (this.terrain == "forest") prob -= 15;
      else if (this.terrain == "hills") prob -= 25;
      else if (this.terrain == "mountain") prob -= 75;
    }

    return prob;
  }
}
</script>

