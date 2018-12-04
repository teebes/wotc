<template>
  <div class="playground-tool">
    <div class="results">
      <div class="inner">
        <h1>
          Stab Chance:
          <span class="color-primary">{{ stab_prob.toPrecision(3) }}</span>
        </h1>
      </div>
    </div>

    <div class="participants">
      <div class="attacker-info panel">
        <form @submit.prevent="submit" autocomplete="off">
          <h2>ATTACKER</h2>

          <div class="pair">
            <div class="form-group">
              <label for="field-attacker_backstab">Backstab</label>
              <input
                id="field-attacker_backstab"
                v-model.number="attacker_backstab"
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

          <div class="pair">
            <div class="form-group">
              <label for="field-attacker_sneak">Sneak</label>
              <input
                id="field-attacker_level"
                v-model.number="attacker_sneak"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <div class="form-group">
              <label for="field-attacker_weapon_skill">Weapon</label>
              <input
                id="field-attacker_weapon_skill"
                v-model.number="attacker_weapon_skill"
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
          <label for="field-victim_notice">Notice</label>
          <input
            id="field-victim_notice"
            v-model.number="victim_notice"
            inputmode="numeric"
            pattern="[0-9]*"
          >
        </div>

        <div class="form-group">
          <label for="field-victim_notice">Level</label>
          <input
            id="field-victim_notice"
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
  attacker_is_hidden: boolean = true;
  attacker_backstab: number = 99;
  attacker_weapon_skill: number = 99;
  attacker_is_berserk: boolean = false;
  attacker_sneak: number = 99;
  attacker_is_kho: boolean = false;

  victim_level: number = 30;
  victim_notice: number = 87;

  get stab_prob() {
    // (MIN(30,GET_LEVEL(ch))-MIN(30,GET_LEVEL(victim)))
    let prob = 0;

    const level_diff =
      Math.min(30, this.attacker_level) - Math.min(30, this.victim_level);

    prob += (Math.max(0, 50 + 2 * level_diff) * this.attacker_backstab) / 99;

    if (this.attacker_weapon_skill < 80) {
      prob = Math.trunc((prob * this.attacker_weapon_skill) / 99);
    }

    // Subtract notice
    prob -= this.victim_notice / 5;

    // Proximate sneak contribution
    prob += (this.attacker_sneak - 50) / 10;

    //prob += Math.max(0, this.attacker_sneak - (Math.random() * 100) / 10);

    return prob;
  }
}
</script>

