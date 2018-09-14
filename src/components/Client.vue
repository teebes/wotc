<template>

    <div id="wot-client">

        <Header v-on:show-help="onShowHelp" />

        <div id="notification-box" v-if="notification.text">
            <div class='ui-notification'>

                <div class='notification-background'></div>

                <div class='message'>{{ notification.text}}</div>

                <div class="close-button" aria-label="Close">
                    <span aria-hidden="true">&#10006;</span>
                </div>
            </div>
        </div>

        <div id="timer-region"></div>

        <div class='main-view'>
            <Game v-if="isLoggedIn"
                  v-bind:messages="messages"/>
            <Login v-else v-on:submit-login="onSubmitLogin"/>
        </div>

        <div id="wot-modal">
            <div class='advent-modal-wrapper' v-if="showHelp">
                <div class='modal-overlay'></div>
                <div class='modal-contents-region'>
                    <Help v-on:close-help="onCloseHelp"/>
                </div>
            </div>
        </div>

</div>
</template>

<script>
import Login from './Login.vue'
import Game from './Game.vue'
import Header from './Header.vue'
import Help from './Help.vue'
import Config from '../config.js'

export default {
    name: 'Client',
    components: {
        Login,
        Game,
        Header,
        Help,
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
            }
        }
    },
    mounted() {
        if (Config.emulate) {
            this.onSubmitLogin(Config.emulate.charname,
                               Config.emulate.password);
        }

    },
    myTest() {
        console.log('works!')
    },
    methods: {
        onSubmitLogin (charname, password) {
            this.notification.text = 'Logging in...';

            const ws = new WebSocket(Config.wsServer);

            ws.onopen = (event) => {
                ws.send(JSON.stringify({
                    type: 'login',
                    data: {
                        'charname': charname,
                        'password': password,
                    }
                }));
            }

            ws.onmessage = (event) => {
                var data = JSON.parse(event.data);
                this.onReceiveMessage(data);
            }

            return;

            console.log(this.ws);

            console.log('Would like to submit with ' + charname + ' and ' + password);
            this.isLoggedIn = true;
        },
        onShowHelp () {
            this.showHelp = true;
        },
        onCloseHelp() {
            this.showHelp = false;
        },

        connect() {
            this.notification.text = 'Connected'
            this.isLoggedIn = true;
            this.messages.push()
        },

        onReceiveMessage(data) {
            console.log("Message received:")
            console.log(data)
            if (data.type === 'connected') {
                this.connect(data);
            }

        }


    },
}
</script>

<style lang="scss">

/* Colors */

$color-background: #191A1C;
$color-text: #EBEBEB;
$color-text-hex-50: #808080;
$color-text-hex-70: #b3b3b3;
$color-primary: #D77617;
$color-primary-rgba: rgba(215, 118, 23, 1.0);
$color-secondary: #f5c983;

$color-text-dark: #161616; // meant to look good against color-text background

$color-green: #279084;
$color-green-70: #266962;
$color-red: #C13434;
$color-red-70: #8b2b2e;

.color-primary { color: $color-primary }

html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
}

body {

    position: relative;
    display: flex;
    flex-direction: column;

    font-family: 'Roboto Mono', monospace;
    font-weight: 100;
    font-size: 12px;

    background: $color-background;
    color: $color-text;


    a {
        color: $color-primary;
        &:hover, &:active, &:focus, .active {
            color: $color-primary;
            text-decoration: none;
        }
    }

}


/* Global components */
.form-group {
    margin-bottom: 1rem;

    label {
        color: $color-secondary;
        font-size: 15px;
        font-weight: 500;
        letter-spacing: 0;
        line-height: 18px;
        white-space: nowrap;
        display: block;
        padding-bottom: .5rem;
    }

    input, textarea, select {
        box-sizing: border-box;
        font-weight: 30;
        background: #111;
        border: 1px solid #424242;
        color: #ebebeb;
        border-radius: 2px;
        font-size: 13px;

        display: block;
        width: 100%;
        padding: 0.5rem 0.75rem;
        outline: 0;
    }
}

button[type=submit] {
    background-color: $color-primary;
    border: 0;
    color: white;
    font-size: 13px;
    line-height: 12px;
    border-radius: 2px;
    padding: 0.75rem 1.5rem;
    font-weight: 700;
    letter-spacing: 1.2px;
}


#wot-client {

    height: 100%;
    width: 100%;
    display: flex;
    flex-grow: 1;

    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    display: flex;
    flex-direction: column;

    min-height: 0;
    min-width: 0;

    #notification-box {
        position: relative;

        .ui-notification {

            border: 3px solid $color-green;
            position: absolute;
            max-width: 300px;
            left: 0;
            right: 0;
            top: 20px;
            margin-right: auto;
            margin-left: auto;
            z-index: 10000;

            div.notification-background {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                width: 100%;
                height: 100%;
                background-color: $color-green-70;
                z-index: 100;
            }

            &.error {
                border-color: $color-red;
                .notification-background {
                    background-color: $color-red-70;
                }
            }

            div.message {
                position: relative;
                padding: 10px;
                display: flex;
                justify-content: center;
                z-index: 110;
            }

            div.close-button {
                &:hover { cursor: pointer }
                position: absolute;
                right: 6px;
                top: 0;
                z-index: 120;

                span {
                    color: $color-text-dark;
                    font-size: 15px;
                }
            }
        }
    }

    #timer-region {

        width: 300px;
        margin: 0 auto;
        margin-top: 20px;

        .timer-view {
            color: $color-text-hex-50;
            width: 300px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;

            background: rgba(26, 26, 28, 0.8);
            border: 1px solid #242629;
        }
    }

    .main-view {
        min-height: 0;
        min-width: 0;

        position: absolute;
        top: 80px;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;

        .game-view {
            position: absolute;
            top: 0;
            bottom: 0px;
            right: 0;
            left: 0;

            min-height: 0;
            min-width: 0;

            max-width: 850px;
            margin: 0 auto;

            display: flex;

            .corner-map-region {


                position: absolute;
                top: 0;
                right: 0;
                z-index: 100;
                canvas {
                    background: rgba(26, 26, 28, 0.8);
                    border: 1px solid #242629;
                }

                &:hover {
                    cursor: pointer;
                }
            }

            .console-region {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 70px;

                display: flex;

                min-height: 0;
                min-width: 0;

                .console {

                    flex-direction: column;

                    //padding-top: 100%;

                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    overflow-y: scroll;

                    > div {

                        margin: 0;

                        pre { color: inherit }

                        &.echo { color: $color-text-hex-50; }

                        &.room-view,
                        //&.echo,
                        &.prompt {
                            margin-bottom: 10px;
                        }

                        span.red {
                            color: $color-red;
                            font-weight: 400;
                        }
                        span.blue {
                            color: #99ccff;
                            font-weight: 400;
                        }
                        span.yellow {
                            color: $color-secondary;
                        }
                        span.green {
                            color: #6ed26e;
                            font-weight: 400;
                        }

                        &:last-child {
                            margin-bottom: 0;
                        }
                    }
                }
            }

            .input-region {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 70px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 0 20px;

                .form-group { margin: 0 }

                .text-input { width: 100% }
            }

            .room-view {
                .room-name {
                    color: #99ccff;
                    font-weight: 400;
                }

                .room-items {
                    color: #6ed26e;
                }

                .room-mobs {
                    color: $color-secondary;
                }

                .room-description {
                    div:empty:before {
                       content: "\200b";
                    }
                }
            }
        }
    }

    #wot-modal {
        top: 0;
        position: fixed;
        z-index: 1000;

        .modal-overlay {
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            position: fixed;
            background: rgba(0, 0, 0, 0.6);

            &.opaque { // meant to completely obscure what's behind
                background: rgba(0, 0, 0, 1);
            }
        }

        .modal-contents-region {
            position: fixed;
            top: 0;
            overflow-y: scroll;
            height: 100%;
            width: 100%;
        }

        .wot-help {

            background: $color-background;
            color: $color-text;
            font-size: 13px;
            border: 10px solid #020202;
            padding: 0;
            max-width: 760px;
            margin: 0 auto;
            vertical-align: middle;


            .cmd {
                color: $color-secondary;
            }

            .title-banner {
                width: 100%;
                display: flex;

                justify-content: space-between;

                .close-icon {
                    color: $color-red;
                    padding: 5px;

                    &:hover { cursor: pointer; }
                }
            }
        }
    }

}

</style>
