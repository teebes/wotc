<template>

<div class='message' :class='type'>
    <span v-for="chunk in chunks" :class='chunk.color' v-html="chunk.text"/>
</div>

</template>

<script>
import color_lines from '../../../js/color-lines.js'

function replace_spaces(original_string) {
    return original_string.replace(/\s/g, '&nbsp;')
}

export default {
    name: 'Default',
    props: ['line', 'type'],
    computed: {
        chunks: function() {
            return color_lines([this.line])[0]
            return color_lines([replace_spaces(this.line)])[0]
        },
    }
}
</script>