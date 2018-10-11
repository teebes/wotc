 define(function(require) {
    "use strict";

    var _ = require('underscore'),

        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Config = require('config'),
        data = require('data'),

        color_lines = require('utils/color_lines'),

        RoomMessageTemplate = require('hbs!templates/wot/message-room'),
        DefaultMessageTemplate = require('hbs!templates/wot/message-default'),

        Channel = Radio.channel('wot');

    var NORTH = 'north',
        EAST = 'east',
        WEST = 'west',
        SOUTH = 'south',
        UP = 'up',
        DOWN = 'down',
        INVERSE_DIRECTIONS = {
            NORTH: SOUTH,
            north: SOUTH,
            EAST: WEST,
            east: WEST,
            SOUTH: NORTH,
            south: NORTH,
            WEST: EAST,
            west: EAST,
            UP: DOWN,
            up: DOWN,
            DOWN: UP,
            down: UP,
        };


    var DefaultMessageView = Marionette.View.extend({
        template: DefaultMessageTemplate,
        className: function() {
            var className = 'message';
            if (this.model.attributes.echo) {
                className += ' echo';
            }
            return className;
        },
        templateContext: function() {
            var lines = [this.model.attributes.data],
                coloredData = color_lines(lines)[0];
            return {
                chunks: coloredData
            };
        }
    });

    var PromptView = DefaultMessageView.extend({
        className: 'message prompt',
    });

    var CastingView = Marionette.View.extend({
        template: false,
        className: 'message casting',
        initialize: function() {
            // Start with the line
            this.symbols = this.model.attributes.data;
            this.listenTo(Channel, 'cast:add', this.onAddSymbol);
            this.listenToOnce(Channel, 'cast:stop', this.onCastStop);
        },
        onRender: function() {
            this.$el.html(this.symbols);
        },
        onAddSymbol: function(symbol) {
            symbol = symbol || ' ';
            this.symbols += symbol;
            this.render();
        },
        onCastStop: function() {
            this.stopListening(Channel, 'cast:add');
        }
    });

    var RoomMessageView = Marionette.View.extend({
        className: 'message room-view',
        template: RoomMessageTemplate,
        templateContext: function() {
            var data = {};

            if (Backbone.$(document).width() < 600) {
                data.single_line_description = this.model.attributes.data.description.join(' ');
                this.model.attributes.data.description = [];
            }

            data.mob_lines = color_lines(this.model.attributes.data.mobs);

            return data;
        }
    });

    var WelcomeView = Marionette.View.extend({
        template: false,
        onRender: function() {
            var pre = Backbone.$('<pre/>');
            pre.text(this.model.attributes.data);
            this.$el.html(pre);
        }
    });

    return Marionette.CollectionView.extend({
        className: 'console',
        bufferSize: 3000,
        events: {
            'scroll': _.throttle(function() {return this.onScroll()}, 250),
        },

        childView: function(message) {
            if (message.attributes.type === 'room')
                return RoomMessageView;
            else if (message.attributes.type === 'welcome')
                return WelcomeView;
            else if (message.attributes.type === 'casting') {
                return CastingView;
            } else if (message.attributes.type === 'prompt') {
                return PromptView;
            }
            return DefaultMessageView;
        },

        initialize: function() {
            // Counter to be increased for the message order, so that
            // even after culling the we get an ever increasing negative
            // ordering number
            this.messageCounter = 0;

            this.isCasting = false;

            this.listenTo(Channel, 'scroll:bottom', this.scrollToBottom);
        },

        onAttach: function() {
            Channel.trigger('input:focus');
        },

        onScroll: function() {
            var distanceToBottom = this.getDistanceToBottom()
            if (distanceToBottom === 0) {
                Channel.trigger('scroll:reset');
            } else {
                Channel.trigger('scroll:active');
            }
        },
        getDistanceToBottom: function() {
            var element = this.$el[0],
                distanceToBottom = (element.scrollHeight
                                        - element.clientHeight
                                        - element.scrollTop);
            return distanceToBottom;
        },
        scrollToBottom: function() {
            var element = this.$el[0];
            element.scrollTop = element.scrollHeight;
        },

        childView: function(message) {
            if (message.attributes.type === 'room')
                return RoomMessageView;
            else if (message.attributes.type === 'welcome')
                return WelcomeView;
            else if (message.attributes.type === 'casting') {
                return CastingView;
            } else if (message.attributes.type === 'prompt') {
                return PromptView;
            }
            return DefaultMessageView;
        },
        onBeforeAddChild: function(childView) {
            var distanceToBottom = this.getDistanceToBottom();
            this.wasScrolledDown = (distanceToBottom === 0) ? true : false;
        },
        onAddChild: function(childView) {
            // See if there the collection needs to be culled
            var delta = this.collection.length - this.bufferSize;
            if (delta > 0) {
                this.collection.remove(this.collection.slice(0, delta));
            }

            var element = this.$el[0];
            if (this.wasScrolledDown) {
                element.scrollTop = element.scrollHeight;
            }

        }
    });

});
