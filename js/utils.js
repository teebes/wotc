
define(function(require) {
    "use strict";

    var _ = require('underscore'),
        Utils = {};


    return function(str, tokens) {
        /*
            From:

            https://stackoverflow.com/questions/650022/how-do-i-split-a-string-with-multiple-separators-in-javascript
        */

        var tempChar = tokens[0]; // We can use the first token as a temporary join character
        for(var i = 1; i < tokens.length; i++){
            str = str.split(tokens[i]).join(tempChar);
        }
        str = str.split(tempChar);
        return str;
    }
});