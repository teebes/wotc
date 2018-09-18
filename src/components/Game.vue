<template>
    <div class='game-view'>
        <div class='corner-map-region'>
            <canvas ref="canvas"
                    id="map"
                    :width="map_width"
                    :height="map_width"
                    @click="showMap"/>
        </div>

        <Console :messages="messages" />

        <Input/>

    </div>
</template>

<script>
import Console from './Console.vue'
import Map from '../js/map.js'
import Config from '../config.js'
import Input from './Input.vue'

export default {
    name: 'Game',
    props: ['messages', 'map', 'current_room_key'],
    components: {
        Console,
        Input,
    },
    data() {
        const map_width = (window.innerWidth >= Config.mobileBreak) ? 270 : 78
        return {
            'map_width': map_width,
        }
    },
    mounted() {
        this.mapRenderer = new Map(this.map, this.$refs.canvas, {
            width: this.map_width
        })
        this.mapRenderer.showView(this.current_room_key)
    },
    watch: {
        current_room_key(new_key) {
            this.mapRenderer.showView(new_key)
        },
    },
    methods: {
        showMap() {
            if (this.map_width === 270) {
                this.map_width = 78
                this.mapRenderer.radius = 1
                this.mapRenderer.width = 78
            } else {
                this.map_width = 270
                this.mapRenderer.radius = 5
                this.mapRenderer.width = 270
            }
            this.$nextTick(() => {
                this.mapRenderer.showView(this.current_room_key)
            })
        }
    }
}
</script>
