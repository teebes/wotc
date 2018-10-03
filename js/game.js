define(function(require) {
    "use strict";

    var _ = require('underscore'),

        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Config = require('config'),

        color_lines = require('utils/color_lines'),

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


    //var InputView = Backbone.Marionette.ItemView.extend({
    var InputView = Backbone.Marionette.View.extend({
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
            'keyup input': 'onKeyUp',
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
        onKeyUp: function(event) {
            var upArrow = 38,
                downArrow = 40,
                input = this.ui.input.val();

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

    //var DefaultMessageView = Backbone.Marionette.ItemView.extend({
    var DefaultMessageView = Backbone.Marionette.View.extend({
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

    //var CastingView = Backbone.Marionette.ItemView.extend({
    var CastingView = Backbone.Marionette.View.extend({
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

    //var RoomMessageView = Backbone.Marionette.ItemView.extend({
    var RoomMessageView = Backbone.Marionette.View.extend({
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

    //var WelcomeView = Backbone.Marionette.ItemView.extend({
    var WelcomeView = Backbone.Marionette.View.extend({
        template: false,
        onRender: function() {
            var pre = Backbone.$('<pre/>');
            pre.text(this.model.attributes.data);
            this.$el.html(pre);
        }
    });

    var ConsoleView = Backbone.Marionette.CollectionView.extend({
        className: 'console',
        bufferSize: 3000,
        events: {
            'scroll': 'onScroll',
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

        },

        attachHtml: function(collectionView, childView, index) {

            if (this.isCasting) {

                if (childView.model.attributes.isCasting) {
                    Channel.trigger('cast:add', childView.model.attributes.data);
                    return;
                } else {
                    this.isCasting = false;
                    Channel.trigger('cast:stop');
                }
            } else if (childView.model.attributes.isCasting) {
                this.isCasting = true;
            }

            Backbone.Marionette.CollectionView.prototype.attachHtml.apply(
                this, arguments);
        },
    });

    // Scroll tool view
    //var ScrollToolView = Backbone.Marionette.ItemView.extend({
    var ScrollToolView = Backbone.Marionette.View.extend({
        className: 'scroll-tool-view',
        template: false,
        initialize: function() {
            this.label = "JUMP TO BOTTOM";
            this.count = 0;
            this.listenTo(Channel, 'receive', function() {
                this.count += 1;
                this.label = "NEW MESSAGES (" + this.count + ")";
                this.render();
            }, this);
        },
        onRender: function() {
            this.$el.html("<div class='new-messages'>" + this.label + "</div>");
        },
    });


    var RoomModel = Backbone.Model.extend({
        idAttribute: "key",
        // Mainly have these to be able to have succint room declarations
        // in splash page map. Remove if it proves problematic.
        defaults: {
            z: 0,
            type: 'road',
        },
        initialize: function(attrs, options) {
            options = options || {};
            var collection = options.collection || {};
            this.zone = collection.zone || null;
        },
        neighbor: function(dir) {
            // Caveat: this only works if the room came from a collection
            var room = this;

            var x = room.get('x');
            var y = room.get('y');
            var z = room.get('z');
            if (dir == 'north') y += 1;
            if (dir == 'east') x += 1;
            if (dir == 'south') y -= 1;
            if (dir == 'west') x -= 1;
            if (dir == 'up') z += 1;
            if (dir == 'down') z -= 1;

            var neighbor = null;
            if (room.collection) {
                _.each(room.collection.models, function(_room){
                    if (_room.attributes.x == x
                        && _room.attributes.y == y
                        && _room.attributes.z == z) {
                        neighbor = {key: _room.attributes.key};
                        return false;
                    }
                });
            }
            return neighbor;
        }
    });

    var MapRoomsCollection = Backbone.Collection.extend({
        model: RoomModel
    });

    var COLORS = {
        white: '#EBEBEB',
        gray: '#A2A2A2',
        green: '#279084',
        black: '#191A1C',
        red: '#c13434',
        primary: '#d77617',
        purple: '#8934c1',
        secondary: '#f5c983',
        pink: '#f583e7'
    };

    var ROOMCOLORS = {
        road: '#9497a1',
        city: '#65686e',
        indoor: '#a48d73',
        field: '#8e9422',
        mountain: '#7a5b3e',
        water: '#4798c4',
        forest: '#207f45',
        desert: '#bf824d',
    };

    //var MapView = Backbone.Marionette.ItemView.extend({
    var MapView = Backbone.Marionette.View.extend({
        tagName: 'canvas',
        template: false,
        id: 'map',
        initialize: function() {
            // half a room's width, as well as the space between two rooms
            this.unit = 8;

            // Map and center are required
            this.map = this.options.map;
            this.centerKey = this.options.centerKey;

            this.width = this.options.width || 270;
            this.radius = this.options.radius || 5;

            // optional
            this.selectedKey = this.options.selectedKey;
            if (this.options.clickable === undefined) {
                this.clickable = true;
            } else {
                this.clickable = this.options.clickable;
            }

            // Set the canvas size
            this.$el.attr('width', this.width);
            this.$el.attr('height', this.width);
            this.$el.css('width', this.width + 'px');
            this.$el.css('height', this.width + 'px');

            this.ctx = this.el.getContext('2d');
        },
        events: {
            'click': 'onClick',
        },
        onRender: function() {
            var start = new Date().getTime();

            // Get the center model
            if (this.centerKey) {
                this.center = this.map.get(this.centerKey);
                this.centerX = this.center.attributes.x;
                this.centerY = this.center.attributes.y;
                this.centerZ = this.center.attributes.z;
            }

            // Filter out elements of the map we're not showing
            this.renderRooms = new MapRoomsCollection();
            this.map.each(function(model) {
                if (Math.abs(model.attributes.x - this.centerX) <= (this.radius + 1)
                    && Math.abs(model.attributes.y - this.centerY) <= (this.radius + 1)
                    && model.attributes.z === this.centerZ) {
                    this.renderRooms.add(model);
                }
            }, this);

            // Set canvas coordinates for each room
            //this.renderRooms.each(function(model, index, collection) {
            this.map.each(function(model, index, collection) {
                // This says, start at half the width of the map, then account
                // for half of an exit, and then do 3 units (2 half room widths
                // + 1 half exit width).
                model.attributes.cx = (
                    this.width / 2
                    - this.unit
                    + 3 * this.unit * (model.attributes.x - this.centerX));
                model.attributes.cy = (
                    this.width / 2
                    - this.unit
                    + 3 * this.unit * (this.centerY - model.attributes.y));
            }, this);

            // Do the actual rendering
            this.ctx.clearRect(0, 0, this.width, this.width);
            this.renderRooms.each(function(model, index, collection) {
                this.drawRoom(model);
            }, this);

        },

        onClick: function(event) {
            var self = this;
            if (!this.clickable) { return; }

            if (self.renderRooms.length == 0) {
                return;
            }

            var x = event.offsetX;
            var y = event.offsetY;

            this.renderRooms.find(function(model, index, collection) {
                if (model.attributes.cx <= x
                    && x <= model.attributes.cx + 2 * this.unit) {
                    if (model.attributes.cy <= y
                        && y <= model.attributes.cy + 2 * this.unit) {
                        //Channels.map.vent.trigger('room:click', model);
                        return true;
                    }
                }
            }, this);
        },

        drawRoom: function(room, room_only) {
            /*
                room_only assumed to be false. Option is mainly included so
                we have the option to do a rooms only second pass of rendering,
                which would fix the issue of trying to draw the connection of
                a river going over a brige level with the ground. The map ends
                up drawing the connection 'above' the level room, and the
                solution is to do a second pass with rooms only to make sure
                we draw over all that, since we never want anything drawn
                over a room.
            */

            if (room_only === undefined) room_only = false;

            var roomColor = ROOMCOLORS[room.attributes.type];

            var x = room.attributes.cx,
                y = room.attributes.cy,
                w = this.unit * 2,
                isSelected = (room.attributes.key === this.selectedKey) ? true : false;

            this.ctx.fillStyle = roomColor;
            if (!isSelected) {
                this.ctx.fillRect(room.attributes.cx, room.attributes.cy, w, w);

                if (room.attributes.flags && room.attributes.flags.length) {
                    this.drawRoomTab(x, y, room.attributes.flags, false);
                }


            } else {
                this.ctx.fillRect(
                    room.attributes.cx - 1,
                    room.attributes.cy - 1,
                    w + 2, w + 2);

                if (room.attributes.flags && room.attributes.flags.length) {
                    this.drawRoomTab(x, y, room.attributes.flags, true);
                }

                this.ctx.fillStyle = COLORS.black;
                this.ctx.fillRect(
                    room.attributes.cx + 2,
                    room.attributes.cy + 2,
                    w - 4, w - 4);
            }

            if (room_only) {return;}

            // NESW connections
            _.each(['north', 'east', 'south', 'west'], function(direction) {
                this.drawConnection(room, direction);
            }, this);

            // U / D connections
            if (room.attributes.up && room.attributes.down) {
                this.drawTriangle(x + 8, y + 5, {selected: true});
                this.drawTriangle(x + 8, y + 11, {down: true, selected: true});
            } else if (room.attributes.up) {
                this.drawTriangle(x + 8, y + 8, {selected: isSelected});
            } else if (room.attributes.down) {
                this.drawTriangle(x + 8, y + 8, {selected: isSelected, down: true});
            }

        },

        drawRoomTab: function(x, y, flags, selected) {
            selected = selected ? 1 : 0;

            // Draw a room tab if necessary
            var color;
            for (var i = 0; i <= flags.length; i++) {
                var flag = flags[i];
                if (flag === 'fountain') {
                    color = ROOMCOLORS.water;
                    break;
                } else if (flag === 'smob') {
                    color = COLORS.red;
                    break;
                } else if (flag === 'trainer') {
                    color = COLORS.white;
                    break;
                } else if (flag === 'exp') {
                    color = COLORS.primary;
                    break;
                } else if (flag === 'horse') {
                    color = ROOMCOLORS.field;
                    break;
                } else if (flag === 'shop') {
                    color = COLORS.green;
                    break;
                } else if (flag === 'inn') {
                    color = COLORS.purple;
                    break;
                } else if (flag === 'herb') {
                    color = COLORS.secondary;
                    break;
                } else if (flag === 'action') {
                    color = COLORS.pink;
                    break;
                }
            }

            if (color) {
                this.ctx.beginPath();
                this.ctx.fillStyle = COLORS.black;
                this.ctx.moveTo(x - 3 - selected + this.unit, y - selected);
                this.ctx.lineTo(x + this.unit * 2 + selected, y - selected);
                this.ctx.lineTo(x + this.unit * 2 + selected, y + this.unit + 3 - selected);
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.fillStyle = color;
                this.ctx.moveTo(x - 2.5 - selected + this.unit, y - selected);
                this.ctx.lineTo(x + this.unit * 2 + selected, y - selected);
                this.ctx.lineTo(x + this.unit * 2 + selected, y + this.unit + 2.5 - selected);
                this.ctx.fill();
            }
        },

        drawTriangle: function(x, y, options) {
            var options = options || {},
                color = options.selected ? COLORS.white : COLORS.black,
                size = options.size || 2;

            this.ctx.beginPath();
            this.ctx.fillStyle = color;
            if (options.down) {
                this.ctx.moveTo(x - 2 * size, y - size);
                this.ctx.lineTo(x + 2 * size, y - size);
                this.ctx.lineTo(x, y + size);
            } else {
                this.ctx.moveTo(x - 2 * size, y + size);
                this.ctx.lineTo(x + 2 * size, y + size);
                this.ctx.lineTo(x, y - size);
            }
            this.ctx.fill();
        },
        drawConnection: function(room, dir) {
            var revDir = INVERSE_DIRECTIONS[dir];
            var exitRoomAttrs = room.get(dir);
            if (!exitRoomAttrs) return;

            var fromCoords = this.getExitCoord(room, dir);

            var exitRoom = this.map.get(exitRoomAttrs.key);
            if (exitRoom && exitRoom.get('z') === room.get('z')) {
                // exit room is in the map, and on the same z-axis

                var toCoords = this.getExitCoord(exitRoom, revDir);

                // Look for the particular case where the exit room is either
                // up or down
                if (exitRoom.attributes.z != room.attributes.z) {
                    this.drawSlope(toCoords, dir, exitRoom.attributes.z - room.attributes.z);
                }

            } else { // exit room not in the map
                var toCoords = [fromCoords[0], fromCoords[1]];
                if (dir === 'south') {
                    toCoords[1] += this.unit;
                } else if (dir === 'north') {
                    toCoords[1] -= this.unit;
                } else if (dir === 'east') {
                    toCoords[0] += this.unit;
                } else if (dir === 'west') {
                    toCoords[0] -= this.unit;
                } else {
                    return;
                }
            }

            // Room going under another room, we shorten the connection by
            // half.
            if (exitRoom && exitRoom.get('z') !== room.get('z')) {
                if (dir === 'south') {
                    toCoords[1] -= this.unit / 2;
                } else if (dir === 'north') {
                    toCoords[1] += this.unit / 2;
                } else if (dir === 'east') {
                    toCoords[0] -= this.unit / 2;
                } else if (dir === 'west') {
                    toCoords[0] += this.unit / 2;
                }
            }

            this.ctx.strokeStyle = COLORS.white;
            this.ctx.beginPath();
            this.ctx.moveTo(fromCoords[0], fromCoords[1]);
            this.ctx.lineTo(toCoords[0], toCoords[1]);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            if (exitRoom) {
                // get the room attrs at the exit of the reverse of the exit room
                var revRoomAttrs = exitRoom.get(revDir);
                if (!revRoomAttrs || revRoomAttrs.key != room.attributes.key) {
                    this.drawOneWay(toCoords, dir);
                }
            }
        },
        drawOneWay: function(toCoords, dir) {
            var x = toCoords[0],
                y = toCoords[1];
            this.ctx.beginPath();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = COLORS.white;
            this.ctx.moveTo(x, y);
            if (dir === 'east') {
                this.ctx.lineTo(x - 4, y - 4);
            } else if (dir === 'west') {
                this.ctx.lineTo(x + 4, y - 4);
            } else if (dir === 'north') {
                this.ctx.lineTo(x - 4, y + 4);
            } else if (dir === 'south') {
                this.ctx.lineTo(x - 4, y - 4);
            }
            this.ctx.moveTo(x, y);
            if (dir === 'east') {
                this.ctx.lineTo(x - 4, y + 4);
            } else if (dir === 'west') {
                this.ctx.lineTo(x + 4, y + 4);
            } else if (dir === 'north') {
                this.ctx.lineTo(x + 4, y + 4);
            } else if (dir === 'south') {
                this.ctx.lineTo(x + 4, y - 4);
            }
            this.ctx.stroke()
        },
        getExitCoord: function(room, dir) {
            var x = room.attributes.cx,
                y = room.attributes.cy;
            // Return coordinates of the exit point
            if (dir == 'north' || dir == 'south') {
                x += this.unit;
            }
            if (dir == 'east' || dir == 'west') {
                y += this.unit;
            }
            if (dir == 'east') {
                x += this.unit * 2;
            }
            if (dir == 'south') {
                y += this.unit * 2;
            }
            return [x, y];
        },
        drawSlope: function(toCoords, dir, slope) {
            // Not doing this right now
            return;

            var isDown = (slope < 0) ? true : false;
            isDown = true;

            if (dir === 'south') {
                var yOffset = isDown ? 11 : 5;

                this.ctx.strokeStyle = COLORS.white;
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(toCoords[0], toCoords[1]);
                this.ctx.lineTo(toCoords[0], toCoords[1] + yOffset);
                this.ctx.stroke();

                this.drawTriangle(toCoords[0], toCoords[1] + yOffset, {
                    selected: true,
                    size: 4,
                    down: isDown,
                });
            } else if (dir == 'east') {
                var yOffset = isDown ? -3 : 3;

                this.ctx.strokeStyle = COLORS.white;
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(toCoords[0], toCoords[1]);
                this.ctx.lineTo(toCoords[0] + 8, toCoords[1]);
                this.ctx.stroke();

                this.drawTriangle(toCoords[0] + 8, toCoords[1] - yOffset, {
                    selected: true,
                    size: 4,
                    down: isDown,
                });
            } else if (dir == 'west') {
                var yOffset = isDown ? -3 : 3;

                this.ctx.strokeStyle = COLORS.white;
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(toCoords[0], toCoords[1]);
                this.ctx.lineTo(toCoords[0] - 8, toCoords[1]);
                this.ctx.stroke();

                this.drawTriangle(toCoords[0] - 8, toCoords[1] - yOffset, {
                    selected: true,
                    size: 4,
                    down: isDown,
                });
            } else if (dir == 'north') {
                var yOffset = isDown ? 5 : 11;

                this.ctx.strokeStyle = COLORS.white;
                this.ctx.lineWidth = 2;
                this.ctx.moveTo(toCoords[0], toCoords[1]);
                this.ctx.lineTo(toCoords[0], toCoords[1] - yOffset);
                this.ctx.stroke();

                this.drawTriangle(toCoords[0], toCoords[1] - yOffset, {
                    selected: true,
                    size: 4,
                    down: isDown,
                });
            }
        }
    });

    //var GameView = Backbone.Marionette.LayoutView.extend({
    var GameView = Backbone.Marionette.View.extend({
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
