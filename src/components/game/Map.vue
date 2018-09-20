<template>
<div class='corner-map-region'>
    <canvas ref="canvas"
            id="map"
            :width="map_width"
            :height="map_width"
            :map_updated_ts="map_updated_ts"
            :updated_ts="$store.state.updated_ts"
            @click="switchMap"/>
</div>
</template>

<script>
import MapRenderer from '../../js/map.js'
import Config from '../../config.js'
import { mapState } from 'vuex'

export default {
    name: 'MapCanvas',
    props: [
        //'map',
        'current_room_key',
    ],
    computed: mapState(['map_updated_ts']),
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
        this.mapRenderer.showView(this.current_room_key)
    },
    updated() {
        if (this.mapRenderer)
            this.mapRenderer.refresh()
    },
    watch: {
        current_room_key(new_key) {
            this.mapRenderer.showView(new_key)
        },
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
                this.mapRenderer.showView(this.current_room_key)
            })
        }
    }

}

</script>