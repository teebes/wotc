<template>
    <Room v-if="message.type == 'room'"
          :room="message.data"/>
    <Default v-else :lines="message.data"/>
    </div>

</template>

<script>
/*
    This component acts as a dispatch between the various kinds of messages,
    as well as a location for the common features of it to exist.
*/

import Room from './messages/Room.vue'
import Default from './messages/Default.vue'

export default {
    name: 'Message',
    props: ['message'],
    components: {
        Room,
        Default
    }
}
</script>