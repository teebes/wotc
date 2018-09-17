<template>
    <div class='game-view'>
        <div class='corner-map-region'>
            <canvas ref="canvas" id="map" width="270" height="270"/>
        </div>

        <Console :messages="messages" />

        <div class='input-region'>
            <div class='text-input'>
                <form @submit.prevent="submit">
                <div class='form-group'>
                    <input type='text'
                           class="form-control"
                           autocomplete='off'
                           autocorrect='off'
                           autocapitalize='off'
                           spellcheck='false'
                           v-model="input"/>
                </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import Console from './Console.vue'
import Map from '../js/map.js'

export default {
    name: 'Game',
    props: ['messages', 'map', 'current_room_key'],
    components: {
        Console,
    },
    data() {
        return {
            'input': '',
        }
    },
    mounted() {
        this.mapRenderer = new Map(this.map, this.$refs.canvas)
    },
    watch: {
        current_room_key(new_key) {
            this.mapRenderer.showView(new_key)
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
