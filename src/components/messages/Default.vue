<template>

<div class='message'>
    <div v-for="line in new_lines">
        <!--
        <span v-for="chunk in line" :class='chunk.color'>{{ chunk.text }}</span>
        -->
        <span v-for="chunk in line" :class='chunk.color' v-html="chunk.text"/>
    </div>
</div>

</template>

<script>
import color_lines from '../../js/color-lines.js'

function replace_spaces(original_string) {
    return original_string.replace(/\s/g, '&nbsp;')
}

export default {
    name: 'Default',
    props: ['lines'],
    computed: {
        new_lines: function() {
            let lines = this.lines

            // Make sure lines is always iterable
            lines = (typeof(lines) === 'string') ? [lines] : lines

            // Process each line and replace white space with &nbsp;
            // so that we can honor ascii art.
            let new_lines = [];
            for (let l of lines) {
                new_lines.push(replace_spaces(l))
            }
            return color_lines(new_lines)
        }
    }
}
</script>