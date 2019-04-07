define(function(require) {
    "use strict";

    var _ = require('underscore'),

        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette');

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

    var ROOM_COLORS = {
        road: '#9497a1',
        city: '#65686e',
        forest: '#207f45',
        indoor: '#a48d73',
        mountain: '#7a5b3e',
        water: '#4798c4',
        desert: '#bf824d',
        field: '#8e9422',
        trail: '#5a8b73',
    };

    var ROOM_FLAGS = {
        inn:  COLORS.purple,
        fountain: ROOM_COLORS.water,
        trainer: COLORS.white,
        horse: ROOM_COLORS.field,
        exp: COLORS.primary,
        smob: COLORS.red,
        shop: COLORS.green,
        herb: COLORS.secondary,
        action: COLORS.pink,
    }

    var NORTH = 'north',
        EAST = 'east',
        WEST = 'west',
        SOUTH = 'south',
        UP = 'up',
        DOWN = 'down';

    var DIRECTIONS = {
            NORTH: NORTH,
            EAST: EAST,
            WEST: WEST,
            SOUTH: SOUTH,
            up: UP,
            down: DOWN,
    }

    var INVERSE_DIRECTIONS = {
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

    return {
        ROOM_FLAGS: ROOM_FLAGS,
        ROOM_COLORS: ROOM_COLORS,
        COLORS: COLORS,
        DIRECTIONS: DIRECTIONS,
        INVERSE_DIRECTIONS: INVERSE_DIRECTIONS,
    }
});