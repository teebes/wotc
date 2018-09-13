<template>

    <div id="wot-client">

        <Header/>

        <div id="notification-box"></div>

        <div id="timer-region"></div>

        <div class='main-view'>
            <component v-on:submit-login="onSubmitLogin"
                   v-bind:is="currentComponent"/>
        </div>

        <div id="wot-modal"></div>

</div>
</template>

<script>
import Login from './Login.vue'
import Game from './Game.vue'
import Header from './Header.vue'

export default {
    name: 'Client',
    components: {
        Login,
        Game,
        Header,
    },
    data() {
        return {
            isLoggedIn: false
        }
    },
    methods: {
        onSubmitLogin (charname, password) {
            console.log(this.ws);

            console.log('Would like to submit with ' + charname + ' and ' + password);
            this.isLoggedIn = true;
        }
    },
    computed: {
        currentComponent: function() {
            return this.isLoggedIn ? 'Game' : 'Login'
        }
    }
}
</script>

<style lang="scss">

/* Colors */

$color-background: #191A1C;
$color-text: #EBEBEB;
$color-text-hex-50: #808080;
$color-primary: #D77617;
$color-primary-rgba: rgba(215, 118, 23, 1.0);
$color-secondary: #f5c983;
$color-red: #C13434;


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

    #notification-box > .ui-notification {
        top: 20px;
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
        z-index: 1000;
        .wot-help {
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
                }
            }
        }
    }

}



</style>

$color-background;
$color-text;
$color-primary;
$color-secondary;
$color-text-hex-50;
$color-red;