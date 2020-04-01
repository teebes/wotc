<template>
  <div class="playground-tool">
    <div class="results">
      <div class="inner">
        <h1>
          Hit Chance:
          <span class="color-primary">{{ hit_chance }}</span>
        </h1>
      </div>
    </div>

    <div class="participants">
      <div class="attacker-info panel">
        <form @submit.prevent="submit" autocomplete="off">
          <h2>ATTACKERS</h2>

          <div class="pair">
            <div class="form-group">
              <label for="field-ob1">OB1</label>
              <input
                id="field-ob1"
                v-model.number="attacker_1_ob"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <div class="form-group">
              <label for="field-ob2">OB2</label>
              <input
                id="field-ob2"
                v-model.number="attacker_2_ob"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </div>

          <div class="pair">
            <div class="form-group">
              <label for="field-ob3">OB3</label>
              <input
                id="field-ob3"
                v-model.number="attacker_3_ob"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <div class="form-group">
              <label for="field-ob4">OB4</label>
              <input
                id="field-ob4"
                v-model.number="attacker_4_ob"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </div>

          <div class="pair">
            <div class="form-group">
              <label for="field-ob5">OB5</label>
              <input
                id="field-ob5"
                v-model.number="attacker_5_ob"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <div class="form-group">
              <label for="field-ob6">OB6</label>
              <input
                id="field-ob6"
                v-model.number="attacker_6_ob"
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
          <label for="field-victim_ob">OB</label>
          <input
            id="field-victim_ob"
            v-model.number="victim_ob"
            inputmode="numeric"
            pattern="[0-9]*"
          >
        </div>

        <div class="form-group">
          <label for="field-victim_db">DB</label>
          <input
            id="field-victim_db"
            v-model.number="victim_db"
            inputmode="numeric"
            pattern="[0-9]*"
          >
        </div>

        <div class="form-group">
          <label for="field-victim_pb">PB</label>
          <input
            id="field-victim_pb"
            v-model.number="victim_pb"
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
import { Pie } from "vue-chartjs";

@Component
export default class extends Vue {
  attacker_1_ob: number = 160;
  attacker_2_ob: number = 0;
  attacker_3_ob: number = 0;
  attacker_4_ob: number = 0;
  attacker_5_ob: number = 0;
  attacker_6_ob: number = 0;

  victim_ob: number = 120;
  victim_pb: number = 140;
  victim_db: number = 120;

  get hit_chance() {
    const total_ob =
      (this.attacker_1_ob || 0) +
      (this.attacker_2_ob || 0) +
      (this.attacker_3_ob || 0) +
      (this.attacker_4_ob || 0) +
      (this.attacker_5_ob || 0) +
      (this.attacker_6_ob || 0);
    let pb = this.victim_pb;
    const db = this.victim_db;
    const ob = this.victim_ob;

    pb = pb / 4 + (pb * ob * 3) / 4 / total_ob;

    const d1size = 120;
    const d2size = 100;

    let phits = 0;
    let pmisses = 0;
    for (let d1 = 1; d1 <= d1size; d1++) {
      for (let d2 = 1; d2 <= d2size; d2++) {
        const pdb = db + d2 * (db / (db + pb));
        const ppb = pb + d2 * (db / (db + pb));

        const dbr = this.attacker_1_ob + d1 > pdb;
        const pbr = this.attacker_1_ob + d1 - pdb > ppb;

        if (dbr && pbr) phits += 1;
        else pmisses += 1;
      }
    }
    return ((phits / (phits + pmisses)) * 100).toFixed(2);
  }
}
</script>

