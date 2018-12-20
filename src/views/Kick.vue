<template>
  <div class="playground-tool">
    <div class="results">
      <div class="inner">
        <h1>
          Kick Chance:
          <span class="color-primary">{{ kick_prob }}</span>
        </h1>
      </div>
    </div>

    <div class="participants">
      <div class="attacker-info panel">
        <form @submit.prevent="submit" autocomplete="off">
          <h2>ATTACKER</h2>

          <div class="pair">
            <div class="form-group">
              <label for="field-attacker_kick">Kick</label>
              <input
                id="field-attacker_kick"
                v-model.number="attacker_kick"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <div class="form-group">
              <label for="field-attacker_ob">OB</label>
              <input
                id="field-attacker_ob"
                v-model.number="attacker_ob"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </div>
        </form>
      </div>

      <div class="defender-info panel">
        <h2>DEFENDER</h2>

        <div class="form-group">
          <label for="field-victim_db">DB</label>
          <input
            id="field-victim_db"
            v-model.number="victim_db"
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
  attacker_kick: number = 99;
  victim_level: number = 30;
  victim_db: number = 130;
  attacker_ob: number = 165;

  get kick_prob() {
    let prob = 0;

    if (this.attacker_kick >= 15) {
      prob = Math.min(
        100,
        this.attacker_kick / 2 + this.attacker_ob / 3 - this.victim_db / 2
      );
    }

    if (prob === 100) prob = 99;

    return Math.trunc(prob);
  }
}
</script>

