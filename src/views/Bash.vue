<template>
  <div class="playground-tool">
    <div class="results">
      <div class="inner">
        <h1>
          Bash Chance:
          <span class="color-primary">{{ bash_chance.toPrecision(3) }}</span>
        </h1>

        <table class="results-table">
          <tbody>
            <tr>
              <td>Base chance</td>
              <td>+</td>
              <td>30</td>
            </tr>
            <tr>
              <td>BMI portion</td>
              <td>
                <span v-if="bmi_portion >= 0">+</span>
                <span v-else>-</span>
              </td>
              <td>{{ Math.abs(bmi_portion.toPrecision(2)) }}</td>
            </tr>
            <tr>
              <td>Stats portion</td>
              <td>
                <span v-if="stats_portion >= 0">+</span>
                <span v-else>-</span>
              </td>
              <td>{{ Math.abs(stats_portion.toPrecision(2)) }}</td>
            </tr>
            <tr>
              <td>Ride bonus</td>
              <td>+</td>
              <td>{{ ride_bonus.toPrecision(1) }}</td>
            </tr>
            <tr>
              <td>Clubs bonus</td>
              <td>+</td>
              <td>{{ clubs_bonus.toPrecision(2) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="advanced-stats form-group inline">
      <input id="field-advanced_stats" v-model="advanced_stats" type="checkbox">
      <label for="field-advanced_stats">Show BMI and Level</label>
    </div>

    <div class="participants">
      <div class="attacker-info panel">
        <form @submit.prevent="submit" autocomplete="off">
          <h2>ATTACKER</h2>

          <div class="pair">
            <div class="form-group">
              <label for="field-wield_weight">Weapon Weight</label>
              <input
                id="field-wield_weight"
                v-model.number="attacker.wield_weight"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <div class="form-group">
              <label for="field-bash_skill">Bash Skill</label>
              <input
                id="field-bash_skill"
                v-model.number="attacker.bash_skill"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </div>

          <div class="pair">
            <div class="form-group">
              <label for="field-char_ob">Char OB</label>
              <input
                id="field-char_ob"
                v-model.number="attacker.wield_ob"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>

            <div class="form-group">
              <label for="field-char_pb">Char PB</label>
              <input
                id="field-char_pb"
                v-model.number="attacker.wield_pb"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </div>

          <div class="pair">
            <div>
              <div class="is_clubs form-group inline">
                <input id="field-is_clubs" v-model="attacker.is_clubs" type="checkbox">
                <label for="field-is_clubs">Is Clubs</label>
              </div>

              <div class="is_riding form-group inline">
                <input id="field-riding" v-model="attacker.is_riding" type="checkbox">
                <label for="field-riding">Riding</label>
              </div>
            </div>

            <div class="form-group">
              <label for="field-weapon_skill">Weapon Skill</label>
              <input
                id="field-weapon_skill"
                v-model.number="attacker.weapon_skill"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </div>

          <template v-if="advanced_stats">
            <div class="pair">
              <div class="form-group">
                <label for="field-attacker_char_feet">Feet</label>
                <input
                  id="field-attacker_char_feet"
                  v-model.number="attacker.char_feet"
                  inputmode="numeric"
                  pattern="[0-9]*"
                >
              </div>

              <div class="form-group">
                <label for="field-attacker_char_inches">Inches</label>
                <input
                  id="field-attacker_char_inches"
                  v-model.number="attacker.char_inches"
                  inputmode="numeric"
                  pattern="[0-9]*"
                >
              </div>
            </div>

            <div class="pair">
              <div class="form-group">
                <label for="field-attacker_naked_weight">Naked Weight</label>
                <input
                  id="field-attacker_naked_weight"
                  v-model.number="attacker.naked_weight"
                  inputmode="numeric"
                  pattern="[0-9]*"
                >
              </div>

              <div class="form-group">
                <label for="field-attacker_worn_weight">Worn Weight</label>
                <input
                  id="field-attacker_worn_weight"
                  v-model.number="attacker.worn_weight"
                  inputmode="numeric"
                  pattern="[0-9.]*"
                >
              </div>
            </div>

            <div class="form-group">
              <label for="field-attacker_bmi">Attacker BMI</label>
              <input
                id="field-attacker_bmi"
                :value="attacker_bmi"
                inputmode="numeric"
                pattern="[0-9]*"
                readonly
              >
            </div>

            <div class="form-group">
              <label for="field-attacker_level">Level</label>
              <input
                id="field-attacker_level"
                v-model.number="attacker.level"
                inputmode="numeric"
                pattern="[0-9]*"
              >
            </div>
          </template>
        </form>
      </div>

      <div class="defender-info panel">
        <h2>DEFENDER</h2>

        <div class="form-group">
          <label for="field-defender_db">DB</label>
          <input
            id="field-defender_db"
            v-model.number="defender.db"
            inputmode="numeric"
            pattern="[0-9]*"
          >
        </div>

        <template v-if="advanced_stats">
          <div class="form-group">
            <label for="field-defender_char_feet">Feet</label>
            <input
              id="field-defender_char_feet"
              v-model.number="defender.char_feet"
              inputmode="numeric"
              pattern="[0-9]*"
            >
          </div>

          <div class="form-group">
            <label for="field-defender_char_inches">Inches</label>
            <input
              id="field-defender_char_inches"
              v-model.number="defender.char_inches"
              inputmode="numeric"
              pattern="[0-9]*"
            >
          </div>

          <div class="form-group">
            <label for="field-defender_naked_weight">Naked Weight</label>
            <input
              id="field-defender_naked_weight"
              v-model.number="defender.naked_weight"
              inputmode="numeric"
              pattern="[0-9]*"
            >
          </div>

          <div class="form-group">
            <label for="field-defender_worn_weight">Worn Weight</label>
            <input
              id="field-defender_worn_weight"
              v-model.number="defender.worn_weight"
              inputmode="numeric"
              pattern="[0-9.]*"
            >
          </div>

          <div class="form-group">
            <label for="field-defender_bmi">Defender BMI</label>
            <input
              id="field-defender_bmi"
              :value="defender_bmi"
              inputmode="numeric"
              pattern="[0-9]*"
              readonly
            >
          </div>

          <div class="form-group">
            <label for="field-defender_level">Level</label>
            <input
              id="field-defender_level"
              v-model.number="defender.level"
              inputmode="numeric"
              pattern="[0-9]*"
            >
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";

interface Char {
  level: number;

  naked_weight: number;
  worn_weight: number;

  char_feet: number;
  char_inches: number;

  wield_weight: number;
  wield_ob: number;
  wield_pb: number;
  is_riding: boolean;
  bash_skill: number;
  weapon_skill: number;
  is_clubs: boolean;
  db: number;
}

@Component
export default class extends Vue {
  attacker!: Char;
  defender!: Char;
  advanced_stats: boolean = false;

  constructor() {
    super();
    const defaults = {
      char_feet: 5,
      char_inches: 8,
      naked_weight: 154,
      worn_weight: 20,

      level: 30,
      wield_weight: 165,
      wield_ob: 180,
      wield_pb: 0,
      is_riding: true,
      bash_skill: 99,
      weapon_skill: 99,
      is_clubs: false,
      db: 130
    };

    this.attacker = { ...defaults };
    this.defender = { ...defaults };
  }

  get attacker_bmi() {
    return (
      (10 * (this.attacker.naked_weight + this.attacker.worn_weight)) /
      (this.attacker.char_feet * 12 + this.attacker.char_inches) ** 2
    );
  }

  get defender_bmi() {
    return (
      (10 * (this.defender.naked_weight + this.defender.worn_weight)) /
      (this.defender.char_feet * 12 + this.defender.char_inches) ** 2
    );
  }

  get bash_chance() {
    let prob = 30 + this.bmi_portion + this.stats_portion;
    prob += this.ride_bonus;
    prob *= this.attacker.bash_skill / 99;
    prob = Math.max(0, prob);

    prob += this.clubs_bonus;

    prob = Math.min(95, prob);
    return prob;
  }

  get bmi_portion() {
    const ch = this.attacker,
      victim = this.defender,
      bmi_diff = this.attacker_bmi - this.defender_bmi;

    let prob = 0;
    if (Math.abs(bmi_diff) > 0.5) {
      prob +=
        Math.trunc(bmi_diff) * 10 +
        Math.min(30, ch.level) -
        Math.min(30, victim.level);
    } else if (Math.abs(bmi_diff) < 0.2) {
      prob +=
        Math.trunc(bmi_diff) * 50 +
        1.5 * (Math.min(30, ch.level) - Math.min(30, victim.level));
    } else {
      prob +=
        Math.trunc(bmi_diff) * 100 +
        Math.min(30, ch.level) -
        Math.min(30, victim.level);
    }
    return prob;
  }

  get stats_portion() {
    const ch = this.attacker,
      victim = this.defender;
    let prob = 0;

    if (ch.wield_weight >= 100) {
      const attacker_portion =
        ((ch.wield_weight / 50) * ch.wield_ob) / 3 + ch.wield_pb / 4;
      const defender_portion = (victim.db * 3) / 2;
      prob = Math.min(30, attacker_portion - defender_portion);
    } else {
      prob = Math.min(
        20,
        ch.wield_ob / 2 + ch.wield_pb / 4 - (victim.db * 3) / 2
      );
    }
    return prob;
  }

  get ride_bonus() {
    return this.attacker.is_riding ? 5 : 0;
  }

  get clubs_bonus() {
    return this.attacker.is_clubs ? this.attacker.weapon_skill / 10 : 0;
  }
}
</script>

<style lang='scss'>
@import "@/styles/base.scss";
</style>