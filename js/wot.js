require.config({
    baseUrl: "/wotc/js",

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

        GameView = require('game'),

        color_lines = require('utils/color_lines'),

        IndexTemplate = require('hbs!templates/wot/index'),
        LoginTemplate = require('hbs!templates/wot/login'),
        HelpTemplate = require('hbs!templates/wot/help'),
        ModalTemplate = require('hbs!templates/wot/modal'),
        UINotificationTemplate = require('hbs!templates/wot/ui_notification_message'),

        Channel = Radio.channel('wot');

    /* VIEWS */

    var TimerView = Backbone.Marionette.View.extend({
        className: 'timer-view',
        template: false,
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

            var self = this;
            this.intervalId = setInterval(function() {
                self.render();
            }, 1000);
        },
        onDestroy: function() {
            clearInterval(this.intervalId);
        }
    });

    var LoginView = Backbone.Marionette.View.extend({
        className: 'login-view single-form',
        template: LoginTemplate,
        ui: {
            submitButton: 'button[type=submit]',
            username: 'input[name=charname]',
        },
        events: {
            'click @ui.submitButton': 'onClickSubmit',
            'keypress': function (event) {
                if (event.which === 13) {
                    event.preventDefault();
                    this.onClickSubmit();
                }
            },
        },
        onRender: function() {
            this.ui.username.focus();
        },
        onClickSubmit: function() {
            var data = this.getFormData();
            if (data) {
                // clear required fields
                this.$('.form-control').removeClass('has-error');
                Channel.trigger('login', data);
            }
            return false;
        },
        getFormData: function() {
            /*
                For each .form-control form field, take the 'name' attribute
                for the key and get the value from jquery.val

                Returns data if all the data is available, null if there
                was an error.
            */
            var data = {},
                missingFields = [];

            this.$('.form-control').each(function(index, formControl) {
                var $formControl = Backbone.$(formControl),
                    name = $formControl.attr('name'),
                    value = $formControl.val();

                if ($formControl.attr('required') === 'required' && value === '') {
                    $formControl.addClass('has-error');
                    missingFields.push(name);
                }

                if ($formControl.attr('type') === 'checkbox') {
                    value = $formControl.is(':checked');
                }

                data[$formControl.attr('name')] = value;
            });

            if (missingFields.length) return null;

            return data;
        },
    });

    var HelpView = Backbone.Marionette.View.extend({
        className: 'edit-quest details-box single-page wot-help',
        template: HelpTemplate,
    });

    var ModalView = Backbone.Marionette.View.extend({
        className: 'advent-modal-wrapper',
        template: ModalTemplate,
        regions: {
            contentsRegion: '.modal-contents-region'
        },
        events: {
            'click .modal-contents-region': 'onClickModalContentsRegion',
            'click .close-icon': 'onClickClose',
        },
        ui: {
            overlay: '.modal-overlay',
        },
        positionModal: function() {
            var view = this.options.view,
                windowHeight = Backbone.$(window).outerHeight(),
                viewHeight = view.$el.outerHeight();
            if (windowHeight > viewHeight) {
                var margin = Math.floor((windowHeight - viewHeight) / 2);
                view.$el.css('margin-top', margin + 'px');
            } else {
                view.$el.css('margin-top', '0');
            }
        },
        onDestroy: function() {
            Backbone.$('body').css('overflow', 'visible');
        },
        onRender: function() {
            this.showChildView('contentsRegion', this.options.view);
            //this.contentsRegion.show(this.options.view);
            Backbone.$('body').css('overflow', 'hidden');
        },
        onClickClose: function(event) {
            this.destroy();
            event.stopPropagation();
        },
        onClickModalContentsRegion: function(event) {
            if (this.options.closeOnContentClick
                || event.target === this.contentsRegion.el) {
                this.destroy();
            }
        },
        onKeyPress: function(code) {
            var closeKey = this.options.closeKey || 'escape';

            if ( // 27 is escape
                (closeKey === 'escape' && code === 27) ||
                (closeKey === 'all')
               ) {
                this.destroy();
            }
        }
    });

    var UINotificationView = Backbone.Marionette.View.extend({
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


    /* ========================== */

    var MainView = Backbone.Marionette.View.extend({
        className: 'wot-client',
        template: IndexTemplate,
        regions: {
            modalRegion: '#wot-modal',
            notificationRegion: '#notification-box',
            timerRegion: '#timer-region',
            headerRegion: '.header-region',
            mainRegion: '.main-region',
            scrollToolRegion: '.scroll-tool-region',
        },

        events: {
            'click .help-icon': 'onClickHelpIcon',
            'click .new-messages': 'onClickNewMessages',
        },
        onClickHelpIcon: function() {
            Channel.trigger('help');
        },

        initialize: function() {
            this.logging_in = false;

            this.listenTo(Channel, 'login', this.onLogin);

            this.listenTo(Channel, 'send', this.onSend);
            this.listenTo(Channel, 'receive', this.onReceive);
            this.listenTo(Channel, 'cmd', this.onCmd);
            this.listenTo(Channel, 'notify', this.onNotify);
            this.listenTo(Channel, 'notify:error', this.onNotifyError);
            this.listenTo(Channel, 'help', this.onHelp);

            // If a console user starts to scroll, the console will emit this
            this.listenTo(Channel, 'scroll:active', this.onActiveScroll);
            this.listenTo(Channel, 'scroll:reset', this.onResetScroll);
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
            //this.modalRegion.show(modalView);
        },
        connect: function(message) {
            this.getRegion('timerRegion').empty();
            //this.timerRegion.empty();

            var game_map = new Backbone.Collection();
            // Due to some odd bug, defining a model that uses key
            // as idAttribute didn't seem to work here, so instead
            // adding the key as the id manually.
            for (var key in message.data.map) {
                var roomData = message.data.map[key];
                roomData.id = roomData.key;
                game_map.add(new Backbone.Model(roomData));
            }

            //this.mainRegion.show(new GameView({
            this.showChildView('mainRegion', new GameView({
                game_map: game_map
            }));

            Channel.trigger('notify', 'Connected');
        },
        disconnect: function(message) {
            this.showChildView('mainRegion', new LoginView());
            //this.mainRegion.show(new LoginView());
            Channel.trigger('notify', 'Connection closed.');
            this.showChildView('timerRegion', new TimerView());
            //this.timerRegion.show(new TimerView());
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

            this.websocket = new WebSocket(Config.wotWsServer);
            this.websocket.onopen = function(event) {
                Channel.trigger('notify', 'Logging in...');
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

            this.websocket.onerror = function(event) {
                Channel.trigger(
                    'notify:error',
                    'No websocket connection available.');
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
                this.disconnect();
                this.logging_in = false;
            } else if (message.type === 'login-error') {
                this.onNotifyError(message.data);
                this.logging_in = false;
            }
        },

        onNotify: function(message, notificationType) {
            this.showChildView('notificationRegion', new UINotificationView({
                model: new Backbone.Model({
                    message: message,
                    notificationType: notificationType
                }),
                autoHide: true
            }));
        },
        onNotifyError: function(message) {
            Channel.trigger('notify', message, 'error');
        },

        /* ==== Scrolling ==== */

        onActiveScroll: function() {
            if (!this.getRegion('scrollToolRegion').hasView()) {
            //if (!this.scrollToolRegion.hasView()) {
                this.showChildView('scrollToolRegion', new ScrollToolView({}));
                //this.scrollToolRegion.show(new ScrollToolView({}));
            }
        },
        onResetScroll: function() {
            this.getRegion('scrollToolRegion').empty()
            //this.scrollToolRegion.empty();
        },
        onClickNewMessages: function() {
            Channel.trigger('scroll:bottom');
            Channel.trigger('input:focus');
            this.getRegion('scrollToolRegion').empty()
            //this.scrollToolRegion.empty()
        },

    });

    /* INIT */

    var app = new Backbone.Marionette.Application({
        region: '#main'
    });

    // Use mustache-like templating
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };

    // Start controllers
    app.on('start', function(){
        console.log('WOT app started');
        app.getRegion().show(new MainView());
    });

    app.start();

});

