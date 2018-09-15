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

function replace_leading_spaces(original_string) {

    return original_string.replace(/\s/g, '&nbsp;')

    // For each line, replace leading spaces with &nbsp;
    function foo() {
      var leadingSpaces = arguments[0].length;
      var str = '';
      while(leadingSpaces > 0) {
        str += '&nbsp;';
        leadingSpaces--;
      }
      return str;
    }

    return original_string.replace(/^[ \t]+/mg, foo);
}

export default {
    name: 'Default',
    props: ['lines'],
    computed: {
        new_lines: function() {
            let lines = [];
            for (let l of this.lines) {
                lines.push(replace_leading_spaces(l));
            }
            return color_lines(lines);
        }
    }
}
</script>