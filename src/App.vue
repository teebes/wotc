<template>
  <div id="app">
    <Client/>
  </div>
</template>

<script>
import Client from './components/Client.vue'

/*
  Will document root events here:
  * send-cmd: send WS cmd. Takes a {type: string, data: string} parameter.
*/

export default {
  name: 'app',
  components: {
    Client
  },
  created: function() {
    console.log('vue app initialized');
  }
}
</script>

<style>
</style>
