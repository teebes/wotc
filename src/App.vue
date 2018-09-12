<template>
  <div id="app">
    <!--img alt="Vue logo" src="./assets/logo.png"-->
    <Client/>
    <!--HelloWorld msg="Welcome to Your Vue.js App"/-->
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Client from './components/Client.vue'

export default {
  name: 'app',
  components: {
    HelloWorld,
    Client
  },
  created: function() {
    console.log('vue app initialized');
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
