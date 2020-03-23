define(function(require) {
    "use strict";

    var _ = require('underscore'),

        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Config = require('config'),
        data = require('data'),
        GameTemplate = require('hbs!templates/wot/game'),
        Channel = Radio.channel('wot'),

        InputView = require('game/input'),
        ConsoleView = require('game/console'),
        MapView = require('game/map');


    var ScrollToolView = Marionette.View.extend({
        className: 'scroll-tool-view',
        template: _.template(
            "<div class='new-messages'> <%= label %></div>"),
        events: {
            'click .new-messages': 'onClickNewMessages',
        },
        initialize: function() {
            this.label = "JUMP TO BOTTOM";
            this.count = 0;
            this.listenTo(Channel, 'receive', this.onReceive);
        },
        templateContext: function() {
            return {
                'label': this.label
            }
        },
        onReceive: function() {
            this.count += 1;
            this.label = "NEW MESSAGES (" + this.count + ")";
            this.render();
        },
        onClickNewMessages: function() {
            Channel.trigger('scroll:reset');
        },
    });

    var ComMessage = Marionette.View.extend({
        template: _.template("<%= data %>"),
        className: function() {
            var className = 'com-msg';
            if (this.model.attributes.color) {
                className += ' ' + this.model.attributes.color;
            }
            return className;
        }
    });

    var ComsView = Marionette.CollectionView.extend({
        className: 'coms-collection',
        childView: ComMessage,
    })

    return Marionette.View.extend({
        /*
            Game view displayed after a successful login
        */

        className: 'game-view',
        template: GameTemplate,
        regions: {
            mapRegion: '.corner-map-region',
            consoleRegion: '.console-region',
            inputRegion: '.input-region',
            scrollToolRegion: '.scroll-tool-region',
            comsRegion: '.coms-region',
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

            this.comsMessages = new Backbone.Collection();

            this.game_map = this.options.game_map;
            this.current_room_key = null;
            this.mapView = null;
            this.listenTo(Channel, 'receive', this.onReceive);
            this.listenTo(Channel, 'send', this.onSend);
            this.listenTo(Channel, 'map:resize', this.showBigMap);

            // If a console user starts to scroll, the console will emit this
            this.listenTo(Channel, 'scroll:active', this.onActiveScroll);
            this.listenTo(Channel, 'scroll:reset', this.onResetScroll);
        },
        onRender: function() {
            this.showChildView('consoleRegion', new ConsoleView({
                collection: this.collection,
            }));

            this.showChildView('inputRegion', new InputView());
            this.showComs();
        },

        showComs: function() {

            if (data.config.coms === 'true') {
                // Set coms height
                var comHeight = this.$el.find('.console-region').height()
                            -
                            this.$el.find('.corner-map-region').height();
                this.$el.find('.coms-region').css('height', comHeight);
                this.showChildView('comsRegion', new ComsView({
                        collection: this.comsMessages,
                    }));
            } else {
                this.getRegion('comsRegion').empty();
                this.$el.find('.coms-region').css('height', 0);
            }
        },

        showBigMap: function() {

            var radius = parseInt(data.config.mapsize) || 5;
            var size;

            if (radius == 2) size = 128;
            if (radius == 3) size = 176;
            if (radius == 4) size = 224;
            if (radius == 5) size = 270;
            if (radius == 6) size = 320;
            if (radius == 7) size = 368;
            if (radius == 8) size = 416;
            if (radius == 9) size = 464;
            if (radius == 10) size = 512;
            if (radius == 11) size = 560;
            if (radius == 12) size = 608;
            if (radius == 13) size = 656;
            if (radius == 14) size = 704;
            if (radius == 15) size = 752;

            this.mapView = new MapView({
                map: this.game_map,
                centerKey: this.current_room_key,
                selectedKey: this.current_room_key,
                width: size,
                radius: radius,
                clickable: false,
            })

            this.showChildView('mapRegion', this.mapView);
            this.$el.find('.coms-region').css('width', size);
            this.showComs();
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
            this.getRegion('comsRegion').empty();
            this.$el.find('.coms-region').css('height', 0);
            this.$el.find('.coms-region').css('width', 0);
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

            } else if (message.type === 'room') {
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

            } else if (message.type === 'tic') {
                Channel.trigger('tic')
            } else if (message.type === 'coms') {
                var delta = this.comsMessages.length - 5;
                if (delta > 0) {
                    this.comsMessages.remove(this.collection.slice(0, delta));
                }
                this.comsMessages.add(new Backbone.Model(message));

            } else if (message.type === 'config') {
                data.config = message.config;
                this.showComs();
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
            if (message.type != 'ping') {
                this.collection.add(messageModel);
            }
        },

        onActiveScroll: function() {
            if (!this.getRegion('scrollToolRegion').hasView()) {
                this.showChildView('scrollToolRegion', new ScrollToolView({}));
            }
        },
        onResetScroll: function() {
            this.getRegion('scrollToolRegion').empty()
            Channel.trigger('scroll:bottom');
            Channel.trigger('input:focus');
        },
    });
});