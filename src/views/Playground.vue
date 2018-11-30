<template>
  <div id="bash-tool">
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

    <div class="participants">
      <div class="attacker-info panel">
        <form @submit.prevent="submit" autocomplete="off">
          <h2>Attacker</h2>

          <div class="pair">
            <div class="form-group">
              <label for="field-bmi">BMI</label>
              <input id="field-bmi" v-model.number="attacker.bmi">
            </div>

            <div class="form-group">
              <label for="field-level">Level</label>
              <input id="field-level" v-model.number="attacker.level">
            </div>
          </div>

          <div class="pair">
            <div class="form-group">
              <label for="field-wield_weight">Weapon Weight</label>
              <input id="field-wield_weight" v-model.number="attacker.wield_weight">
            </div>

            <div class="form-group">
              <label for="field-bash_skill">Bash Skill</label>
              <input id="field-bash_skill" v-model.number="attacker.bash_skill">
            </div>
          </div>

          <div class="pair">
            <div class="form-group">
              <label for="field-char_ob">Char OB</label>
              <input id="field-char_ob" v-model.number="attacker.wield_ob">
            </div>

            <div class="form-group">
              <label for="field-char_pb">Char PB</label>
              <input id="field-char_pb" v-model.number="attacker.wield_pb">
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
              <input id="field-weapon_skill" v-model.number="attacker.weapon_skill">
            </div>
          </div>
        </form>
      </div>

      <div class="defender-info panel">
        <h2>Defender</h2>

        <div class="form-group">
          <label for="field-defender_bmi">BMI</label>
          <input id="field-defender_bmi" v-model="defender.bmi">
        </div>

        <div class="form-group">
          <label for="field-defender_db">DB</label>
          <input id="field-defender_db" v-model="defender.db">
        </div>

        <div class="form-group">
          <label for="field-defender_level">Level</label>
          <input id="field-defender_level" v-model="defender.level">
        </div>
      </div>
    </div>
  </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";

interface Char {
  level: number;
  bmi: number;
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
export default class Playground extends Vue {
  attacker!: Char;
  defender!: Char;

  constructor() {
    super();
    const defaults = {
      bmi: 24.5,
      level: 30,
      wield_weight: 170,
      wield_ob: 160,
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
      victim = this.defender;
    let prob = 0;
    if (Math.abs(ch.bmi - victim.bmi) > 0.5) {
      prob +=
        Math.floor(ch.bmi - victim.bmi) * 10 +
        Math.min(30, ch.level) -
        Math.min(30, victim.level);
    } else if (Math.abs(ch.bmi - victim.bmi) < 0.2) {
      prob +=
        Math.floor(ch.bmi - victim.bmi) * 50 +
        1.5 * (Math.min(30, ch.level) - Math.min(30, victim.level));
    } else {
      prob +=
        Math.floor(ch.bmi - victim.bmi) * 100 +
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
        ((ch.wield_weight / 50) * ch.wield_ob) / 3 + ch.wield_pb;
      const defender_portion = (victim.db * 3) / 2;
      prob = Math.min(30, attacker_portion - defender_portion);
    } else {
      prob = Math.min(20, ch.wield_ob / 2 + ch.wield_pb / 4 - (ch.db * 3) / 2);
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

#bash-tool {
  max-width: 375px;
  width: 100%;
  margin: 0 auto;

  .results {
    margin: 0 auto;
    padding: 20px;

    .inner {
      margin: 0 auto;

      h1 {
        margin-top: 10px;
        @media (min-width: 650px) {
          margin-top: 25px;
        }
        margin-bottom: 10px;
      }

      table.results-table {
        tr {
          td:first-child {
            padding-right: 30px;
            color: $color-text-hex-70;
          }
        }
      }
    }
  }

  .participants {
    display: flex;
    justify-content: space-between;

    .attacker-info,
    .defender-info {
      flex-grow: 1;
      h2 {
        margin-bottom: 10px;
      }
    }

    .attacker-info {
      flex: 2;
      margin-right: 20px;

      .pair {
        display: flex;
        > div {
          &:not(:first-child) {
            padding-left: 5px;
          }
          &:not(:last-child) {
            padding-right: 5px;
          }
          flex: 1;
        }
      }

      .is_riding {
        margin-bottom: 0;
        padding-top: 8px;
        label {
          padding-bottom: 0;
        }
      }
    }

    .defender-info {
      flex: 1;
    }

    .panel {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.25);
      background: $color-background-light;
      border: 1px solid $color-background-light-border;
      padding: 10px;
    }
  }
}
</style>