<template>
    <div class='game-view'>
        <div class='corner-map-region'>
            <canvas id="map" width="270" height="270"/>
        </div>

        <Console :messages="messages" />

        <div class='input-region'>
            <div class='text-input'>
                <div class='form-group'>
                    <input type='text'
                           class="form-control"
                           autocomplete='off'
                           autocorrect='off'
                           autocapitalize='off'
                           spellcheck='false'
                           v-model="input"
                           @keyup.enter='submit'/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Console from './Console.vue'

export default {
    name: 'Game',
    props: ['messages'],
    components: {
        Console,
    },
    data() {
        return {
            'input': '',
        }
    },
    methods: {
        submit() {
            const input = this.input;
            this.input = '';

            const cmd = {
                type: 'cmd',
                data: input,
            }
            this.$emit('send-cmd', cmd)
        }
    }
}
</script>
