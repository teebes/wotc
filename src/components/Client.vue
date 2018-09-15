<template>

<div id="wot-client">

    <Header v-on:show-help="showHelp = true" />

    <div id="notification-box" >
        <Notification v-if="notification.text"
                      :notification="notification"
                      v-on:close-notification="notification.text = ''"/>
    </div>

    <div id="timer-region"></div>

    <div class='main-view'>

        <Game v-if="isLoggedIn"
              v-bind:messages="messages"
              v-bind:map="map"
              v-on:send-cmd="sendCmd"/>

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

export default {
    name: 'Client',
    components: {
        Login,
        Game,
        Header,
        Help,
        Notification
    },
    data() {
        return {
            isLoggedIn: false,
            showHelp: false,

            // A message is composed of chunks, so that we can support
            // things like differently colored blocks of text.
            messages: [],

            notification: {
                text: '',
                isError: false,
            },

            map: [],
        }
    },
    mounted() {
        if (Config.emulate) {
            this.onSubmitLogin(Config.emulate.charname,
                               Config.emulate.password);
        }

    },
    methods: {
        onSubmitLogin (charname, password) {
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
                console.log(data);
                ws.send(JSON.stringify(data));
            }

            ws.onmessage = (event) => {
                var data = JSON.parse(event.data);
                this.onReceiveMessage(data);
            }

            this.ws = ws;
        },

        connect(data) {
            this.notification.text = 'Connected'
            this.isLoggedIn = true;
            //this.messages.push()

            this.map = data.map
        },

        onReceiveMessage(data) {
            console.log("Message received:")
            console.log(data)
            if (data.type === 'connected') {
                this.connect(data);
            } else if (['incoming', 'room'].includes(data.type)) {
                this.messages.push(data);
            }

        },

        sendCmd(data) {
            this.messages.push(data)
            this.ws.send(JSON.stringify(data))
        }
    },

}


</script>

<style lang="scss">

</style>
