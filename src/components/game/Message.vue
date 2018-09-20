<template>
    <Room v-if="message.type == 'room'"
          :room="message.data"/>
    <Cast v-else-if="message.type == 'cast'"
          :text="message.data"/>
    <pre v-else-if="message.type == 'welcome'"
         v-html="message.data"
         class='message'/>
    <Default v-else :type="message.type" :line="message.data"/>
    </div>

</template>

<script>
/*
    This component acts as a dispatch between the various kinds of messages,
    as well as a location for the common features of it to exist.
*/

import Room from './messages/Room.vue'
import Default from './messages/Default.vue'
import Cast from './messages/Cast.vue'

export default {
    name: 'Message',
    props: ['message'],
    components: {
        Room,
        Default,
        Cast
    }
}
</script>