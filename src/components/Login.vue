<template>
    <div>

        <h1>LOG IN</h1>

        <div>
            <label for="field-charname">Character Name</label>
            <input id="field-charname" v-model="charname" placeholder="Character Name">
        </div>


        <div class="form-group">
            <label for="field-password">Password</label>
            <input id="field-password" v-model="password" type="password" placeholder="Password">
        </div>

        <button @click="onSubmit">LOGIN</button>

        <div class='my-test'>
            a <span>blue</span> thing
        </div>

    </div>
</template>

<script>
import Config from '../config.js'

export default {
    name: 'Login',
    data() {
        return {
            charname: '',
            password: '',
        }
    },
    methods: {
        onSubmit() {
            this.$emit('submit-login', this.charname, this.password);
            return;

            const ws = new WebSocket(Config.wsServer);
            ws.onopen = (event) => {
                ws.send(JSON.stringify({
                    type: 'login',
                    data: {
                        'charname': this.charname,
                        'password': this.password,
                    }
                }));
            }

        }
    }

}
</script>

<style lang="scss">
.my-test { span { color: blue } }
</style>