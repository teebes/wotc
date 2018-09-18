const COLORS = {
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

const ROOMCOLORS = {
    road: '#9497a1',
    city: '#65686e',
    indoor: '#a48d73',
    field: '#8e9422',
    mountain: '#7a5b3e',
    water: '#4798c4',
    forest: '#207f45',
    desert: '#bf824d',
};

const INVERSE_DIRECTIONS = {
    'north': 'south',
    'south': 'north',
    'east': 'west',
    'west': 'east',
    'up': 'down',
    'down': 'up',
}


export default class {
    constructor(rooms, canvas, options) {
        /*
            rooms: dictionary keyed by room key
            canvas: DOM canvas element
        */

        this.rooms = rooms
        this.canvas = canvas
        this.options = options || {}

        // Create a 2d context in the canvas element
        this.ctx = canvas.getContext('2d');

        // Configuration / options
        this.radius = this.options.radius || 5;
        this.width = this.options.width || 270;
        this.unit = 8;
    }

    showView(center_key) {
        /*
            Only after knowing what room to show around can we determine
            which rooms to include, as well as what their coordinates are.
        */

        let renderRooms = [],
            cRoom = this.rooms[center_key]

        // If the center key is not found in the map, we're not going to be
        // able to do anything
        if (!cRoom) return

        for (const rkey in this.rooms) {
            const room = this.rooms[rkey]

            if (Math.abs(room.x - cRoom.x) <= (this.radius + 1)
                && Math.abs(room.y - cRoom.y) <= (this.radius + 1)
                && room.z === cRoom.z) {
                renderRooms.push(room);

                // This says, start at half the width of the map, then account
                // for half of an exit, and then do 3 units (2 half room widths
                // + 1 half exit width).
                room.cx = (
                    this.width / 2
                    - this.unit
                    + 3 * this.unit * (room.x - cRoom.x));
                room.cy = (
                    this.width / 2
                    - this.unit
                    + 3 * this.unit * (cRoom.y - room.y));
            }
        }

        // Do the actual rendering
        this.ctx.clearRect(0, 0, this.width, this.width);
        for (const room of renderRooms) {
            this.drawRoom(room, center_key);
        }
    }

    drawRoom(room, center_key) {
        var roomColor = ROOMCOLORS[room.type];

        var x = room.cx,
            y = room.cy,
            w = this.unit * 2,
            isSelected = (room.key === center_key) ? true : false;

        this.ctx.fillStyle = roomColor;
        if (!isSelected) {
            this.ctx.fillRect(room.cx, room.cy, w, w);

            if (room.flags && room.flags.length) {
                this.drawRoomTab(x, y, room.flags, false);
            }


        } else {
            this.ctx.fillRect(
                room.cx - 1,
                room.cy - 1,
                w + 2, w + 2);

            if (room.flags && room.flags.length) {
                this.drawRoomTab(x, y, room.flags, true);
            }

            this.ctx.fillStyle = COLORS.black;
            this.ctx.fillRect(
                room.cx + 2,
                room.cy + 2,
                w - 4, w - 4);
        }

        // NESW connections
        for (const direction of ['north', 'east', 'south', 'west']) {
            this.drawConnection(room, direction);
        }

        // U / D connections
        if (room.up && room.down) {
            this.drawTriangle(x + 8, y + 5, {selected: true});
            this.drawTriangle(x + 8, y + 11, {down: true, selected: true});
        } else if (room.up) {
            this.drawTriangle(x + 8, y + 8, {selected: isSelected});
        } else if (room.down) {
            this.drawTriangle(x + 8, y + 8, {selected: isSelected, down: true});
        }

    }

    drawRoomTab(x, y, flags, selected) {
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
    }

    drawTriangle(x, y, options) {
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
    }

    drawConnection(room, dir) {
        var revDir = INVERSE_DIRECTIONS[dir];
        var exitRoomAttrs = room[dir];
        if (!exitRoomAttrs) return;

        var fromCoords = this.getExitCoord(room, dir);

        var exitRoom = this.rooms[exitRoomAttrs.key];
        if (exitRoom && exitRoom.z === room.z) {
            // exit room is in the map, and on the same z-axis

            var toCoords = this.getExitCoord(exitRoom, revDir);

            // Look for the particular case where the exit room is either
            // up or down
            if (exitRoom.z != room.z) {
                this.drawSlope(toCoords, dir, exitRoom.z - room.z);
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
        if (exitRoom && exitRoom.z !== room.z) {
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
            var revRoomAttrs = exitRoom[revDir];
            if (!revRoomAttrs || revRoomAttrs.key != room.key) {
                this.drawOneWay(toCoords, dir);
            }
        }
    }

    drawOneWay(toCoords, dir) {
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
    }

    getExitCoord(room, dir) {
        // Return coordinates of the exit point
        let x = room.cx,
            y = room.cy;
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
    }

}

