define(function(require) {
    "use strict";

    var _ = require('underscore'),

        Backbone = require('backbone'),
        Radio = require('backbone.radio'),
        Marionette = require('marionette'),
        Config = require('config'),
        data = require('data'),
        GameInputTemplate = require('hbs!templates/wot/input'),
        Channel = Radio.channel('wot');

    return Marionette.View.extend({
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
        onAttach: function() {
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
                'stand', 'stands', 'standing', 'resting', 'sitting',
                'fighting', 'sleeping',
            ];
            var mobs = data.currentRoom.mobs,
                items = data.currentRoom.items,
                things = mobs.concat(items);

            var replacement;
            _.find(things, function(line) {
                return _.find(line.split(/[\s,\.]+/), function(word) {
                    if (!word) return true;

                    word = word.toLowerCase()
                    if (!excludeWords.includes(word)
                        && word.match(lastToken)) {
                        replacement = word;
                        return true;
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

            if (event.altKey) {
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

});