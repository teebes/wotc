<template>
    <div class='single-form login-view'>

        <h1>LOG IN</h1>

        <div class='form-group'>
            <label for="charname">Character Name</label>
            <input id="charname" v-model="charname" placeholder="Character Name" @keyup.enter='throttledSubmit'>
        </div>


        <div class="form-group">
            <label for="password">Password</label>
            <input id="password" v-model="password" type="password" placeholder="Password" @keyup.enter='throttledSubmit'>
        </div>

        <button class='color-primary' type='submit' @click="throttledSubmit">LOGIN</button>

    </div>
</template>

<script>
import Config from '../config.js'
import _ from 'lodash'

export default {
    name: 'Login',
    data() {
        return {
            charname: '',
            password: '',
        }
    },
    methods: {
        throttledSubmit: _.throttle(function() {
            this.$emit('submit-login', this.charname, this.password)
        }, 3000, {trailing: false})
    }

}
</script>

<style lang="scss" scoped>
.login-view {
    width: 200px;

    margin: 0 auto;
    align-self: center;

    border: 10px solid #020202;
    padding: 30px 40px;

    h1 {
        color: #EBEBEB;
        margin: 0 0 1.5em 0;
        display: block;
        width: 100%;
        border-bottom: 1px solid;
        padding-bottom: 10px;
        font-size: 1.5em;

    }

    a:hover { text-decoration: underline; }

}
</style>