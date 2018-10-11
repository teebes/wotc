define(function(require) {
    "use strict";

    var _ = require('underscore'),
        $ = require('jquery'),
        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Config = require('config'),
        data = require('data'),
        ModalTemplate = require('hbs!templates/wot/modal'),
        Channel = Radio.channel('wot');

    return Marionette.View.extend({
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

            var self = this;
            this.listenTo(Backbone.$(document).keydown(function(e){
                self.onKeyPress(e.which);
            }));
        },
        onClickClose: function(event) {
            this.destroy();
            event.stopPropagation();
        },
        onClickModalContentsRegion: function(event) {
            if (this.options.closeOnContentClick
                || event.target === this.getRegion('contentsRegion').el) {
                this.destroy();
            }
        },
        onKeyPress: function(code) {
            console.log('.')
            var closeKey = this.options.closeKey || 'escape';

            if ( // 27 is escape
                (closeKey === 'escape' && code === 27) ||
                (closeKey === 'all')
               ) {
                this.destroy();
            }
        }
    });


});