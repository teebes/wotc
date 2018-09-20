<template>

<div id="wot-client">

    <Header v-on:show-help="showHelp = true" />

    <div id="notification-box" >
        <Notification v-if="notification.text"
                      :notification="notification"
                      v-on:close-notification="notification.text = ''"/>
    </div>


    <Timer v-if="showTimer"/>

    <div class='main-view'>

        <Game v-if="isLoggedIn"/>

        <Login v-else v-on:submit-login="onSubmitLogin"/>

    </div>

    <div id="wot-modal">
        <div class='advent-modal-wrapper' v-if="showHelp">
            <div class='modal-overlay'></div>
            <div class='modal-contents-region' @click="showHelp = false">
                <Help v-on:click-close-button="showHelp = false"/>
            </div>
        </div>
    </div>

</div>

</template>

<script>
// Style import
import '../scss/global.scss'

import Login from './Login.vue'
import Game from './Game.vue'
import Header from './Header.vue'
import Help from './Help.vue'
import Config from '../config.js'
import Notification from './Notification.vue'
import Timer from './Timer.vue'

export default {
    name: 'Client',
    components: {
        Login,
        Game,
        Header,
        Help,
        Notification,
        Timer,
    },
    data() {
        return {
            isLoggedIn: false,
            showHelp: false,
            showTimer: false,

            notification: {
                text: '',
                isError: false,
            },

            castMessage: null,
        }
    },
    mounted() {
        if (Config.emulate) {
            this.onSubmitLogin(Config.emulate.charname,
                               Config.emulate.password);
        }

        this.$root.$on('send-cmd', this.sendCmd)

    },
    methods: {
        onSubmitLogin (charname, password) {

            if (!charname || !password) {
                this.notification.isError = true
                this.notification.text = 'Name and password are required.'
                return false
            }

            this.notification.text = 'Logging in...';

            const ws = new WebSocket(Config.wsServer);

            ws.onopen = (event) => {
                const data = {
                    type: 'login',
                    data: {
                        'charname': charname,
                        'password': password,
                    }
                }
                ws.send(JSON.stringify(data));
            }

            ws.onmessage = (event) => {
                var data = JSON.parse(event.data);
                this.onReceiveMessage(data);
            }

            ws.onerror = (event) => {
                this.notification.isError = true
                this.notification.text = "No websocket connection available."
            }

            this.ws = ws;
        },

        onReceiveMessage(message) {
            console.log("Message received:")
            console.log(message)

            if (message.type === 'connected') {
                this.notification.isError = false
                this.notification.text = 'Connected'
                this.$store.commit('resetMap', message.data.map)
                this.showTimer = false
                this.isLoggedIn = true
            }

            else if (message.type === 'room') {
                this.$store.commit('addMessage', message)
                this.$store.commit('setCurrentRoomData', message.data)
            }

            else if (message.type === 'disconnected') {
                this.notification.text = 'Connection closed'
                this.isLoggedIn = false
                this.showTimer = true
            }

            else if (message.type === 'welcome') {
                this.$store.commit('addMessage', message)
            }

            else if (message.type === 'login-error') {
                this.notification.isError = true
                this.notification.text = message.data
            }

            else if (message.type === 'new_rooms') {
                const new_rooms = {}
                for (const room_data of message.data) {
                    new_rooms[room_data.key] = room_data
                }
                this.$store.commit('addToMap', new_rooms)
                this.$store.commit('setCurrentRoomData', message.data[0])
            }

            else if (message.type === 'rebuild') {
                this.current_room_key = message.data.current_room_key
                this.$store.commit('resetMap', message.data.map)
            }

            else if (message.data) {

                let lines = message.data
                lines = typeof(lines) === 'string' ? [lines] : lines

                for (const line of lines) {

                    // If the line has nothing but casting symbols, assume
                    // it's a cast
                    if (/^[-=+*\s]+$/.exec(line)) {

                        if (this.castMessage) {
                            this.castMessage.data += line
                        } else {
                            this.castMessage = {
                                type: 'cast',
                                data: line,
                            }
                            this.$store.commit('addMessage', message)
                        }
                    } else {
                        this.castMessage = null;

                        const message = { data: line }

                        const promptRe = new RegExp("[\\*o]\\s(R\\s)?(S\\s)?HP:\\w+\\s((S|D)P:\\w+\\s)?MV:\\w+\\s(-(\\s[-\\w]+)+:\\s\\w+\\s)*>.*");
                        if (promptRe.exec(line)) {
                            message.type = 'prompt'
                        }

                        this.$store.commit('addMessage', message)
                    }

                }
            }

        },

        sendCmd(data) {
            this.$store.commit('addMessage', data)
            this.ws.send(JSON.stringify(data))
        }



    },

}


</script>

<style lang="scss">

</style>
