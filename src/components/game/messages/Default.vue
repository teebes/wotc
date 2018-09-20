<template>

<div class='message' :class='type'>
    <span v-for="chunk in chunks" :class='chunk.color' v-bind:key="chunk.key">{{ chunk.text }}</span>
</div>

</template>

<script>
import color_lines from '../../../js/color-lines.js'

/*
function replace_spaces(original_string) {
    return original_string.replace(/\s/g, '&nbsp;')
}
*/

export default {
    name: 'Default',
    props: ['line', 'type'],
    computed: {
        chunks: function() {
            if (!this.line) return []
            return color_lines([this.line])[0]
        },
    }
}
</script>