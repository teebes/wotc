define(function(require) {
    "use strict";

    var _ = require('underscore'),
        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Constants = require('constants');

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

    var MapView = Marionette.View.extend({
        tagName: 'canvas',
        template: _.template(''),
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

            var roomColor = Constants.ROOM_COLORS[room.attributes.type];

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

                this.ctx.fillStyle = Constants.COLORS.black;
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
                if (flag in Constants.ROOM_FLAGS) {
                    color = Constants.ROOM_FLAGS[flag]
                    break;
                }
            }

            if (color) {
                this.ctx.beginPath();
                this.ctx.fillStyle = Constants.COLORS.black;
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
                color = options.selected ? Constants.COLORS.white : Constants.COLORS.black,
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
            var revDir = Constants.INVERSE_DIRECTIONS[dir];
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

            this.ctx.strokeStyle = Constants.COLORS.white;
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
            this.ctx.strokeStyle = Constants.COLORS.white;
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

                this.ctx.strokeStyle = Constants.COLORS.white;
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

                this.ctx.strokeStyle = Constants.COLORS.white;
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

                this.ctx.strokeStyle = Constants.COLORS.white;
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

                this.ctx.strokeStyle = Constants.COLORS.white;
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

    return MapView;
});