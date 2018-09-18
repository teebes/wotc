<template>
<div class='input-region'>
    <div class='text-input'>
        <form @submit.prevent="submit">
        <div class='form-group'>
            <input ref='input'
                   type='text'
                   class="form-control"
                   autocomplete='off'
                   autocorrect='off'
                   autocapitalize='off'
                   spellcheck='false'
                   v-model="input"
                   @keydown.meta.left="move('west')"
                   @keydown.meta.right="move('east')"
                   @keydown.meta.up="move('north')"
                   @keydown.meta.down="move('south')"
                   @keyup.up.prevent.stop="up"
                   @keyup.down.prevent.stop="down"/>
        </div>
        </form>
    </div>
</div>
</template>

<script>

export default {
    name: 'Input',
    data() {
        return {
            'input': '',
        }
    },
    watch: {
        input(new_input) {
            if (new_input === '') {
                this.originalInput = null
                this.historyIndex = -1
            }
        }
    },
    mounted() {
        this.$refs.input.focus()
        this.lastCommand = null
        // command history variables
        this.commandHistory = []
        this.historyIndex = -1
        this.originalInput = null
    },
    methods: {
        submit() {
            let input = this.input;
            this.input = '';

            if (!input) {
                if (this.last_command) {
                    input = this.last_command
                } else {
                    return
                }
            }

            this.lastCommand = input

            // After this point, we know input is the command that will be
            // sent. We want now to maintain a history of recent commands.

            // First though, we want to remove any existing occurences of
            // the command just issued in the history stack.
            _.remove(this.commandHistory, n => n == input)

            // Second, we insert the newest command at the bottom of the
            // stack so that [0] pulls the most recent command
            this.commandHistory.splice(0, 0, input)

            // Only keep history through 10 recent
            if (this.commandHistory.length > 10) {
                this.commandHistory.splice(10)
            }

            // Send to websocket
            this.$root.$emit('send-cmd', {
                type: 'cmd',
                data: input,
            })
        },
        move(direction) {
            this.$root.$emit('send-cmd', {
                type: 'cmd',
                data: direction,
            })
        },
        up() {
            if (!this.input && this.commandHistory.length == 0) {
                return
            }

            const nextIndex = this.historyIndex + 1
            // If no command history item corresponds to that item, do nothing
            if (nextIndex > this.commandHistory.length - 1) return

            if (nextIndex == 0 && !this.originalInput)
                this.originalInput = this.input


            this.input = this.commandHistory[nextIndex]
            this.historyIndex = nextIndex

        },
        down() {
            if (!this.input && this.commandHistory.length == 0) {
                return
            } else if (this.historyIndex <= -1) {
                return
            }

            const nextIndex = this.historyIndex - 1

            if (nextIndex === -1) {
                if (this.originalInput) {
                    this.input = this.originalInput
                    this.originalInput = ''
                } else {
                    this.input = ''
                }
            } else {
                this.input = this.commandHistory[nextIndex]
            }

            this.historyIndex = nextIndex
        },
    }
}
</script>