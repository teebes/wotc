define(function(require) {
    "use strict";

    var _ = require('underscore'),

        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Config = require('config'),
        data = require('data'),

        color_lines = require('utils/color_lines'),

        MapView = require('map'),

        GameTemplate = require('hbs!templates/wot/game'),
        RoomMessageTemplate = require('hbs!templates/wot/message-room'),
        DefaultMessageTemplate = require('hbs!templates/wot/message-default'),
        GameInputTemplate = require('hbs!templates/wot/input'),

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


    //var InputView = Marionette.ItemView.extend({
    var InputView = Marionette.View.extend({
        /*

        Magic input box. Has two implementations of a repeat-command pattern,
        configurable via the ``repeatHighlight`` option.

        */
        className: 'text-input',
        template: GameInputTemplate,
        ui: {
            input: 'input',
            sendButton: 'button',
        },
        events: {
            'submit form': 'onSubmit',
            'keydown input': 'onKeyDown',
        },
        initialize: function() {
            this.commandHistory = [];
            this.historyIndex = -1;
            this.originalInput = null;
            this.listenTo(Channel, 'input:focus', this.onFocus);
        },
        onRender: function() {
            this.onFocus();
        },
        onFocus: function() {
           this.ui.input.focus();
        },
        onSubmit: function(event) {
            event.preventDefault();
            var cmd = this.ui.input.val();

            if (!cmd) {
                // Empty enter means repeat last cmd
                if (this.lastCommand) {
                    cmd = this.lastCommand;
                }
            }

            this.lastCommand = cmd;

            this.commandHistory = _.without(this.commandHistory, cmd)

            // Second, we insert the newest command at the bottom of the
            // stack so that [0] pulls the most recent command
            this.commandHistory.splice(0, 0, cmd)

            // Only keep history through 20 recent
            if (this.commandHistory.length > 20) {
                this.commandHistory.splice(20)
            }

            Channel.trigger('cmd', cmd)

            this.ui.input.val('')
            return false;
        },

       // Special keys
        onTab: function(event) {

            // Get the input
            var input = this.ui.input.val();
            if (!input || !data.currentRoom) return;

            event.preventDefault();

            var tokens = input.split(/\s+/),
                lastToken = tokens[tokens.length - 1].toLowerCase();

            if (tokens.length === 1) return;

            var excludeWords = [
                'a', 'the', 'an', 'of', 'for', 'on', 'is', 'here', 'with',
            ];
            var mobs = data.currentRoom.mobs,
                items = data.currentRoom.items,
                things = mobs.concat(items);

            var replacement;
            _.find(things, function(line) {
                return _.find(line.split(/[\s,\.]+/), function(word) {
                    if (!word) return true;

                    word = word.toLowerCase()
                    if (!excludeWords.includes(word)) {
                        //keyword = word;
                        if (word.match(lastToken)) {
                            replacement = word;
                            return true;
                        }
                    }
                });

            });

            if (replacement) {
                tokens.splice(tokens.length - 1, 1, replacement);
                this.ui.input.val(tokens.join(' '));
            }

        },

        onKeyDown: function(event) {
            var upArrow = 38,
                downArrow = 40,
                rightArrow = 39,
                leftArrow = 37,
                input = this.ui.input.val();

            if (event.which === 9) {
                this.onTab(event);
                return;
            }

            if (event.metaKey) {
                var cmd = null;
                if (event.which == upArrow) {
                    cmd = 'n';
                } else if (event.which == downArrow) {
                    cmd = 's';
                } else if (event.which == leftArrow) {
                    cmd = 'w';
                } else if (event.which == rightArrow) {
                    cmd = 'e';
                }
                if (cmd) {
                    Channel.trigger('cmd', cmd);
                    event.preventDefault();
                }
                return;
            }

            if (event.which == upArrow) {
                if (input && this.commandHistory.length == 0) {
                    return
                }

                var nextIndex = this.historyIndex + 1
                // If no command history item corresponds to that item, do nothing
                if (nextIndex > this.commandHistory.length - 1) return

                if (nextIndex == 0 && !this.originalInput)
                    this.originalInput = input

                this.ui.input.val(this.commandHistory[nextIndex])
                this.historyIndex = nextIndex

            } else if (event.which == downArrow) {
                if (!input && this.commandHistory.length == 0) {
                    return
                } else if (this.historyIndex <= -1) {
                    return
                }

                var nextIndex = this.historyIndex - 1

                if (nextIndex === -1) {
                    if (this.originalInput) {
                        this.ui.input.val(this.originalInput)
                        this.originalInput = ''
                    } else {
                        this.ui.input.val('')
                    }
                } else {
                    this.ui.input.val(this.commandHistory[nextIndex])
                }

                this.historyIndex = nextIndex
            }
        }
    });

    //var DefaultMessageView = Marionette.ItemView.extend({
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

    //var CastingView = Marionette.ItemView.extend({
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

    //var RoomMessageView = Marionette.ItemView.extend({
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

    //var WelcomeView = Marionette.ItemView.extend({
    var WelcomeView = Marionette.View.extend({
        template: false,
        onRender: function() {
            var pre = Backbone.$('<pre/>');
            pre.text(this.model.attributes.data);
            this.$el.html(pre);
        }
    });

    var ConsoleView = Marionette.CollectionView.extend({
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

    //var GameView = Marionette.LayoutView.extend({
    var GameView = Marionette.View.extend({
        /*
            Game view displayed after a successful login
        */

        className: 'game-view',
        template: GameTemplate,
        regions: {
            mapRegion: '.corner-map-region',
            consoleRegion: '.console-region',
            inputRegion: '.input-region',
        },
        events: {
            'click .corner-map-region': 'onClickMap',
        },
        initialize: function () {
            this.collection = new Backbone.Collection();
            this.collection.add(new Backbone.Model({
                type: 'incoming',
                data: 'Connected.'
            }));

            this.game_map = this.options.game_map;
            this.current_room_key = null;
            this.mapView = null;
            this.listenTo(Channel, 'receive', this.onReceive);
            this.listenTo(Channel, 'send', this.onSend);
        },
        onRender: function() {
            console.log('rendering')

            //this.consoleRegion.show(new ConsoleView({
            this.showChildView('consoleRegion', new ConsoleView({
                collection: this.collection,
            }));

            this.showChildView('inputRegion', new InputView());
        },

        showBigMap: function() {
            this.mapView = new MapView({
                map: this.game_map,
                centerKey: this.current_room_key,
                selectedKey: this.current_room_key,
                width: 270,
                radius: 5,
                clickable: false,
            })
            this.showChildView('mapRegion', this.mapView);
            //this.mapRegion.show(this.mapView);
            this.mapSize = 'big';
        },

        showSmallMap: function() {
            this.mapView = new MapView({
                map: this.game_map,
                centerKey: this.current_room_key,
                selectedKey: this.current_room_key,
                width: 78,
                radius: 1,
                clickable: false,
            })
            this.showChildView('mapRegion', this.mapView);
            //this.mapRegion.show(this.mapView);
            this.mapSize = 'small';
        },

        onClickMap: function(message) {
            if (this.mapSize === 'small')
                this.showBigMap();
            else if (this.mapSize === 'big')
                this.showSmallMap();
        },

        onReceive: function(message) {
            if (message.type === 'new_rooms') {
                _.each(message.data, function(room_data) {
                    room_data.id = room_data.key;
                    var newRoom = new Backbone.Model(room_data)
                    this.game_map.add(newRoom, {merge: true});
                }, this);
                this.current_room_key = message.data[0].key;
                this.mapView.centerKey = this.current_room_key;
                this.mapView.selectedKey = this.current_room_key;
                this.mapView.render();

            } else if (message.type === 'rebuild') {
                var game_map = new Backbone.Collection();
                // Due to some odd bug, defining a model that uses key
                // as idAttribute didn't seem to work here, so instead
                // adding the key as the id manually.
                for (var key in message.data.map) {
                    var roomData = message.data.map[key];
                    roomData.id = roomData.key;
                    game_map.add(new Backbone.Model(roomData));
                }
                this.current_room_key = message.data.current_room_key;
                this.game_map = game_map;
                this.showBigMap();

            } else  if (message.type === 'room') {
                var messageModel = new Backbone.Model(message);
                this.collection.add(messageModel);

                if (!this.current_room_key) {

                    this.current_room_key = message.data.key;

                    var width = Backbone.$(document).width();
                    if (width < 650) {
                        this.showSmallMap();
                    } else {
                        this.showBigMap();
                    }

                } else {
                    this.current_room_key = message.data.key;
                    this.mapView.centerKey = this.current_room_key;
                    this.mapView.selectedKey = this.current_room_key;
                    this.mapView.render();
                }

                data.currentRoom = message.data;

            } else if (message.type === 'welcome') {
                var messageModel = new Backbone.Model(message);
                this.collection.add(messageModel);

            } else {
                _.each(message.data, function(line) {

                    if (!line.length) { return true; }

                    // If the line has nothing but
                    if (/^[-=+*\s]+$/.exec(line)) {
                        var messageModel = new Backbone.Model({
                            type: 'casting',
                            data: line,
                            isCasting: true,
                        });

                        if (this.isCasting) {
                            Channel.trigger('cast:add', line);
                            return;
                        } else {
                            this.isCasting = true;
                        }
                    } else {
                        var promptRe = new RegExp("[\\*o]\\s(R\\s)?(S\\s)?HP:\\w+\\s((S|D)P:\\w+\\s)?MV:\\w+\\s(-(\\s[-\\w]+)+:\\s\\w+\\s)*>.*");
                        if (promptRe.exec(line)) {
                            var messageModel = new Backbone.Model({
                                type: 'prompt',
                                data: line,
                            });
                        } else {
                            var messageModel = new Backbone.Model({
                                type: 'incoming',
                                data: line,
                            });
                        }

                        if (this.isCasting) {
                            this.isCasting = false;
                            Channel.trigger('cast:stop');
                        }
                    }

                   this.collection.add(messageModel);
                }, this);
            }

        },

        onSend: function(message) {
            message.echo = true;
            //message.data = message.data;
            var messageModel = new Backbone.Model(message);
            this.collection.add(messageModel);
        },
    });

    return GameView;

});
