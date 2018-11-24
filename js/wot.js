require.config({
    baseUrl: "/wot/js",

    deps: ['backbone.radio', 'marionette', 'wot'],

    paths: {
        // Config file
        config: '../config-wot',

        // Core
        jquery: '../bower_components/jquery/dist/jquery.min',
        underscore: '../bower_components/underscore/underscore',
        backbone: '../bower_components/backbone/backbone',
        'backbone.radio': '../bower_components/backbone.radio/build/backbone.radio',
        marionette: '../bower_components/backbone.marionette/lib/backbone.marionette',
        json2: '../bower_components/json2/json2',

        // Handlebars
        hbs: '../bower_components/require-handlebars-plugin/hbs',
        templates: '../templates',
    },

    // handlebars build params
    pragmasOnSave: {
        excludeHbsParser : true,
        excludeHbs: true,
        excludeAfterBuild: true
    },

    shim: {
        "underscore": {
            exports: "_"
        },
        "backbone": {
            deps: ["jquery", "underscore"],
            exports: "Backbone"
        },
        "backbone.radio": {
            deps: ["backbone"],
            exports: "backbone.radio",
        },
        "json2": {
            exports: "JSON"
        },
    },

    // how many seconds for requirejs to wait to load depdencies
    waitSeconds: 30
});


var EMULATE = {
    charname: 'somechar',
    password: 'somepass'
};
EMULATE = false;

define(function(require) {
    "use strict";

    var _ = require('underscore'),
        $ = require('jquery'),
        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Config = require('config'),
        data = require('data'),

        GameView = require('game/index'),
        LoginView = require('login'),
        ModalView = require('modal'),
        HelpView = require('help'),

        color_lines = require('utils/color_lines'),

        IndexTemplate = require('hbs!templates/wot/index'),
        ModalTemplate = require('hbs!templates/wot/modal'),
        UINotificationTemplate = require('hbs!templates/wot/ui_notification_message'),

        Channel = Radio.channel('wot');

    // Use mustache-like templating
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    /* VIEWS */

    var TimerView = Marionette.View.extend({
        className: 'timer-view',
        template: _.template('{{ minutes }}:{{ seconds }}'),
        initialize: function() {
            this.tstart = new Date();
        },
        onRender: function() {
            var seconds_since = Math.ceil((new Date() - this.tstart) / 1000);

            var minutes = Math.floor(seconds_since / 60);
            var seconds = seconds_since - minutes * 60;

            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            this.$el.html(minutes + ':' + seconds);
        },
        templateContext: function() {
            var seconds_since = Math.ceil((new Date() - this.tstart) / 1000);

            var minutes = Math.floor(seconds_since / 60);
            var seconds = seconds_since - minutes * 60;

            if (seconds < 10) {
                seconds = '0' + seconds;
            }
            return {
                seconds: seconds,
                minutes: minutes,
            }
        },
        onAttach: function() {
            var self = this;
            this.intervalId = setInterval(function() {
                self.render();
            }, 1000);
        },
        onDestroy: function() {
            clearInterval(this.intervalId);
        }
    });



    var UINotificationView = Marionette.View.extend({
        className: function() {
            var classNames = 'ui-notification';
            if (this.model.attributes.notificationType) {
                classNames = classNames + ' ' + this.model.attributes.notificationType;
            }
            return classNames;
        },
        template: UINotificationTemplate,
        events: {
            'click .close-button': 'onClickCloseButton'
        },
        initialize: function(options) {
            this.autoHide = true;
            if (options.autoHide !== undefined) {
                this.autoHide = options.autoHide;
            }
        },
        onClickCloseButton: function(event) {
            this.remove();
        },
        onRender: function() {
            if (this.autoHide) {
                var self = this;
                // Autoclose after 5 seconds
                setTimeout(function() {
                    self.remove();
                }, 5000);
            }
        }
    });


    var TicTimerView = Marionette.View.extend({
        template: _.template("{{ secondsLeft }}"),
        templateContext: function() {
            return {
                secondsLeft: this.secondsLeft
            }
        },
        onAttach: function() {
            var self = this;
            this.secondsLeft = 60;
            this.intervalId = setInterval(function() {
                if (self.secondsLeft <= 1) {
                    self.secondsLeft = 60
                } else {
                    self.secondsLeft -= 1;
                }
                self.render();
            }, 1000);
        },
        onDestroy: function() {
            clearInterval(this.intervalId)
        }
    })

    /* ========================== */

    var MainView = Marionette.View.extend({
        className: 'wot-client',
        template: IndexTemplate,
        regions: {
            modalRegion: '#wot-modal',
            notificationRegion: '#notification-box',
            timerRegion: '#timer-region',
            mainRegion: '.main-region',
            ticTimerRegion: '.tic-timer-region',
        },

        events: {
            'click .help-icon': 'onClickHelpIcon',
        },
        onClickHelpIcon: function() {
            Channel.trigger('help');
        },

        initialize: function() {
            this.logging_in = false;
            this.logged_in = false;

            this.listenTo(Channel, 'login', this.onLogin);

            this.listenTo(Channel, 'send', this.onSend);
            this.listenTo(Channel, 'receive', this.onReceive);
            this.listenTo(Channel, 'cmd', this.onCmd);
            this.listenTo(Channel, 'notify', this.onNotify);
            this.listenTo(Channel, 'notify:error', this.onNotifyError);
            this.listenTo(Channel, 'help', this.onHelp);
            this.listenTo(Channel, 'tic', this.onTic);
        },

        onRender: function() {
            this.showChildView('mainRegion', new LoginView());

            // Debugging tool to speed up testing.
            if (EMULATE) {
                Channel.trigger('login', EMULATE);
            }
        },
        onHelp: function(message) {
            var modalView = new ModalView({
                view: new HelpView()
            })
            this.showChildView('modalRegion', modalView);
        },
        connect: function(message) {
            this.getRegion('timerRegion').empty();

            data.config = message.data.config;

            var game_map = new Backbone.Collection();
            // Due to some odd bug, defining a model that uses key
            // as idAttribute didn't seem to work here, so instead
            // adding the key as the id manually.
            for (var key in message.data.map) {
                var roomData = message.data.map[key];
                roomData.id = roomData.key;
                game_map.add(new Backbone.Model(roomData));
            }

            if (data.config.layout === 'wide') {
                this.$el.find('.main-region').addClass('wide')
            }

            this.showChildView('mainRegion', new GameView({
                game_map: game_map
            }));

            this.logged_in = true;
            Channel.trigger('notify', 'Connected');
        },
        onLogin: function(data) {
            /*
                Send a login request to the websocket.
            */

            if (this.logging_in) {
                console.log('interrupting login');
                return;
            } else {
                this.logging_in = true;
            }

            var self = this;

            this.websocket = new WebSocket(Config.wotWsServer);
            this.websocket.onopen = function(event) {
                Channel.trigger('notify', 'Logging in...', 'info', false);
                Channel.trigger('send', {
                    'type': 'login',
                    'data': {
                        'charname': data.charname,
                        'password': data.password,
                    },
                });
            };
            this.websocket.onmessage = function(event) {
                var data = Backbone.$.parseJSON(event.data);
                Channel.trigger('receive', data);
            },

            // this.websocket.onerror = function(event) {
            //     Channel.trigger(
            //         'notify:error',
            //         'No websocket connection available.');
            //     self.logging_in = false;
            // }

            this.websocket.onclose = function(event) {
                Channel.trigger(
                    'notify:error',
                    'No websocket connection available.');
                self.logging_in = false;
                if (self.logged_in) {
                    self.showChildView('mainRegion', new LoginView());
                    self.showChildView('timerRegion', new TimerView());
                    self.logged_in = false;
                }
            }
        },
        onCmd: function(cmd) {
            Channel.trigger('send', {type: 'cmd', data: cmd});
        },
        onSend: function(message) {
            if (!this.websocket) {
                return;
            }
            console.log("Sending: ");
            console.log(message);
            Channel.trigger('scroll:bottom');
            this.websocket.send(JSON.stringify(message));
        },
        onReceive: function(message) {
            console.log("Received: ");
            console.log(message);

            if (message.type === 'connected') {
                this.connect(message);
            } else if (message.type === 'disconnected') {
                this.showChildView('mainRegion', new LoginView());
                this.showChildView('timerRegion', new TimerView());
                Channel.trigger('notify', 'Connection closed.');
                this.logging_in = false;
                self.logged_in = false;
                var view = this.getChildView('ticTimerRegion')
                if (view) { view.destroy() }
            } else if (message.type === 'login-error') {
                this.onNotifyError(message.data);
                this.logging_in = false;
            } else if (message.type === 'config') {
                data.config = message.config
                
                if (data.config.tictimer && data.config.tictimer !== 'true') {
                    this.onTic()
                }

                if (data.config.layout === 'wide') {
                    this.$el.find('.main-region').addClass('wide')
                } else {
                    this.$el.find('.main-region').removeClass('wide')
                }
            }
        },

        onNotify: function(message, notificationType, autoHide) {
            // make autoHide true by default
            if (autoHide === undefined) autoHide = true;

            this.showChildView('notificationRegion', new UINotificationView({
                model: new Backbone.Model({
                    message: message,
                    notificationType: notificationType
                }),
                autoHide: autoHide
            }));
        },
        onNotifyError: function(message) {
            Channel.trigger('notify', message, 'error');
        },

        onTic: function() {
            var view = this.getChildView('ticTimerRegion')
            if (view) { view.destroy() }
            if (data.config.tictimer !== 'true') { return; }
            this.showChildView('ticTimerRegion', new TicTimerView());
        }

        /* ==== Scrolling ==== */

        /*
        onActiveScroll: function() {
            if (!this.getRegion('scrollToolRegion').hasView()) {
                this.showChildView('scrollToolRegion', new ScrollToolView({}));
            } else {
                console.log('has view');
            }
        },
        onResetScroll: function() {
            this.getRegion('scrollToolRegion').empty()
        },
        onClickNewMessages: function() {
            Channel.trigger('scroll:bottom');
            Channel.trigger('input:focus');
            this.getRegion('scrollToolRegion').empty()
        },
        */

    });

    /* INIT */

    var app = new Marionette.Application({
        region: '#main'
    });

    // Start controllers
    app.on('start', function(){
        console.log('WOT app started');
        data.launched = true;
        app.getRegion().show(new MainView());
    });

    app.start();

});

