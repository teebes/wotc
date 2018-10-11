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
            // Replace the 'field' key with 'noride'
            var room_colors = _.clone(Constants.ROOM_COLORS);
            var field_color = room_colors.field;
            delete room_colors.field;
            room_colors.noride = field_color;

            return {
                room_flags: Constants.ROOM_FLAGS,
                room_colors: room_colors,
            }
        },
    });

});