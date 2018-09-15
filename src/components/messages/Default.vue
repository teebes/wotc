<template>

<div class='message'>
    <div v-for="line in new_lines">
        <span v-for="chunk in line" :class='chunk.color'>{{ chunk.text }}</span>
    </div>
</div>

</template>

<script>
import color_lines from '../../js/color-lines.js'

export default {
    name: 'Default',
    props: ['lines'],
    computed: {
        new_lines: function() {
            const new_lines = color_lines(this.lines);
            console.log(new_lines);
            return new_lines;
        }
    }
}
</script>