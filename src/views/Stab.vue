<template>
    <div id="stab-tool">

        <div class='results'>
            <div class='inner'>
                <h1>
                    Stab Chance: <span class='color-primary'></span>
                    Stab Damage: <span class='color-secondary'></span>
                </h1>
            </div>
        </div>

        <div class="participants">
            <div class="attacker-info panel">
                <form @submit.prevent="submit" autocomplete="off">
                <h2>ATTACKER</h2>

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
                <h2>DEFENDER</h2>

                <div class="form-group">
                <label for="field-defender_bmi">BMI</label>
                <input id="field-defender_bmi" v-model.number="defender.bmi">
                </div>

                <div class="form-group">
                <label for="field-defender_db">DB</label>
                <input id="field-defender_db" v-model.number="defender.db">
                </div>

                <div class="form-group">
                <label for="field-defender_level">Level</label>
                <input id="field-defender_level" v-model.number="defender.level">
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts'>
import { Component, Vue, Prop } from "vue-property-decorator";
@Component
export default class extends Vue {
    
}
</script>

