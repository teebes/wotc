define(function(require) {
    "use strict";

    var _ = require('underscore');

    var COLORS_LOOKUP = {
        '\x1b[31m': 'red',
        '\x1b[36m': 'blue',
        '\x1b[32m': 'green',
        '\x1b[33m': 'yellow',
        '\x1b[0m': 'normal',
    }
    var COLOR_LIST = [
        '\x1b[31m',
        '\x1b[36m',
        '\x1b[32m',
        '\x1b[33m',
        '\x1b[0m',
    ]
    var END_COLOR = '\x1b[0m';

    var find_color = function(text) {

        var matched_color = null,
            shortest_length = 1000;

        _.each(COLOR_LIST, function(color) {
            if (text.includes(color)) {
                // Find the length of the chunk of text preceding the color
                var pre_length = text.split(color)[0].length;
                if (pre_length < shortest_length) {
                    shortest_length = pre_length;
                    matched_color = color;
                }
            }
        });

        return matched_color;
    }

    var color_lines = function(orig_lines) {
        /*
            For each line, we have to determine whether it is a single
            block of text all in one color, or whether it is composed
            of colored blocks.

            Example output of two lines, one of which has color:

            lines = [
                [
                    {
                        'color': 'normal',
                        'text': 'This is just a normal line of text.'
                    }
                ],
                [
                    {
                        'color': 'normal',
                        'text', 'This is is a line with a ',
                    },
                    {
                        'color': 'red',
                        'text', 'red word',
                    },
                    {
                        'color': 'normal',
                        'text', ' in the middle of it',
                    },
                ]
            ]
        */
        var lines = [];

         _.each(orig_lines, function(line) {

            // Blocks is what the line gets broken up into
            var blocks = [],
                remainder = line.trim();

            if (!remainder || remainder == END_COLOR) return true;

            // Go through the line and see if there are colors in it
            while (remainder.length) {
                var color_code = find_color(remainder);

                if (!color_code) {
                    blocks.push({
                        color: 'normal',
                        text: remainder,
                    })
                    break
                }

                // Split on the color code and store the chunk of text
                // (if any) that was before it.
                var tokens = remainder.split(color_code),
                    before = tokens.shift();
                    remainder = tokens.join(color_code);

                if (before) {
                    blocks.push({color: 'normal', text: before});
                }


                while(true) {
                    var new_color = find_color(remainder);
                    if (new_color) {
                        var tokens = remainder.split(new_color);
                        var colored_section = tokens.shift();
                        var remainder = tokens.join(new_color);
                        blocks.push({
                            color: COLORS_LOOKUP[color_code],
                            text: colored_section
                        });
                        color_code = new_color;
                    } else {
                        break;
                    }
                }

                if (remainder) {
                    blocks.push({
                        color: COLORS_LOOKUP[color_code],
                        text: remainder,
                    });
                }
                remainder = '';
            }

            lines.push(blocks);

        });

        return lines;
    }

    return color_lines;
});