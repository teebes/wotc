<template>
<div class='room-view'>
    <div class='room-name'>{{ room.display_name }}</div>

    <div v-if="room.show_desc" class='room-description'>
        <div v-if="single_line_description">{{ single_line_description }}</div>
        <div v-else>
            <div v-for="line in room.description">{{ line }}</div>
        </div>
    </div>

    <div class='room-exit'>{{ room.exits }}</div>

    <div v-if="room.note" class='room-note'>{{ room.note }}</div>

    <div class='room-autotrack'>
        <div v-for="line in room.autotrack_lines">{{ line }}</div>
    </div>

    <div class='room-autoscan'>
        <div v-for="line in room.autoscan_lines">{{ line }}</div>
    </div>

    <div class='room-items'>
        <div v-for="item in room.items">{{ item }}</div>
    </div>

    <div class='room-mobs'>
        <div v-for="line in mob_lines" class='line'>
            <span v-for="chunk in line" class="chunk.color">
                {{ chunk.text }}
            </span>
        </div>
    </div>

    <div>{{ room.prompt }}</div>

</div>
</template>

<script>
import color_lines from '../../js/color-lines.js'

export default {
    name: 'Room',
    props: ['room'],
    computed: {
        single_line_description() {
            return ''
        },
        mob_lines() {
            console.log('===== MOBS =====')
            console.log(this.room.mobs)
            return color_lines(this.room.mobs)
        }
    }
}
</script>