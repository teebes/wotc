define(function(require) {
    "use strict";

    var _ = require('underscore'),
        $ = require('jquery'),
        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Config = require('config'),
        Channel = Radio.channel('wot'),
        LoginTemplate = require('hbs!templates/wot/login');

    return Marionette.View.extend({
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
        onAttach: function() {
            this.ui.username.focus();
        },
        onClickSubmit: function() {
            var data = this.getFormData();
            if (data) {
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

            // Clear previous errors if any
            this.$('.form-control').removeClass('has-error');

            this.$('.form-control').each(function(index, formControl) {
                var $formControl = Backbone.$(formControl),
                    name = $formControl.attr('name'),
                    value = $formControl.val();

                if ($formControl.attr('required') === 'required' && !value) {
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
});