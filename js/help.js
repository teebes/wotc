define(function(require) {
    "use strict";

    var _ = require('underscore'),
        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Constants = require('constants'),
        HelpTemplate = require('hbs!templates/wot/help');

    return Marionette.View.extend({
        className: 'edit-quest details-box single-page wot-help',
        template: HelpTemplate,
        templateContext: function() {

            // Replace 'field' with 'noride' and 'forest' with 'outside'
            var room_colors = {};
            for (var color in Constants.ROOM_COLORS) {
                if (color === 'forest') {
                    room_colors.outside = Constants.ROOM_COLORS[color];
                } else if (color === 'field') {
                    room_colors.noride = Constants.ROOM_COLORS[color];
                } else {
                    room_colors[color] = Constants.ROOM_COLORS[color];
                }
            }

            return {
                room_flags: Constants.ROOM_FLAGS,
                room_colors: room_colors,
            }
        },
    });

});