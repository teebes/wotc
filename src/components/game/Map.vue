<template>
<div class='corner-map-region'>
    <canvas ref="canvas"
            id="map"
            :width="map_width"
            :height="map_width"
            :updated_ts="$store.state.map.updated_ts"
            :current_room_key="$store.state.current_room_data.key"
            @click="switchMap"/>
</div>
</template>

<script>
import MapRenderer from '../../js/map.js'
import Config from '../../config.js'
//import { mapState } from 'vuex'

export default {
    name: 'MapCanvas',
    data() {
        const map_width = (window.innerWidth >= Config.mobileBreak) ? 270 : 78
        return {
            'map_width': map_width,
        }
    },
    mounted() {
        this.mapRenderer = new MapRenderer(
            this.$store.state.map.rooms,
            this.$refs.canvas, {
                width: this.map_width
            })
        this.mapRenderer.showView(
            this.$store.state.current_room_data.key)
    },
    updated() {
        if (this.mapRenderer)
            this.mapRenderer.showView(
                this.$store.state.current_room_data.key)
    },
    methods: {
        switchMap() {
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
                this.mapRenderer.showView(
                    this.$store.state.current_room_data.key)
            })
        }
    }

}

</script>