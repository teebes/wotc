<template>
    <div>
        <component v-on:submit-login="onSubmitLogin"
                   v-bind:is="currentComponent"/>


    </div>
</template>

<script>
import Login from './Login.vue'
import Game from './Game.vue'

export default {
    name: 'Client',
    components: {
        Login,
        Game,
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
