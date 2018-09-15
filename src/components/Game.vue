<template>
    <div class='game-view'>
        <div class='corner-map-region'></div>
        <div class='console-region'>
            <div class='console' @scroll="onScroll">
                <div class='message'>Welcome</div>
                <Message v-for="message in messages"
                         v-bind:message="message" />
            </div>
        </div>
        <div class='input-region'></div>
    </div>
</template>

<script>
import Message from './Message.vue'

export default {
    name: 'Game',
    props: ['messages'],
    components: {
        Message,
    },
    watch: {
        messages: function(newV, oldV) {
            console.log('new: ' + newV.length + ' old: ' + oldV.length);
        }
    },
    methods: {
        onScroll(event) {
            const element = event.target;
            const distanceToBottom = element.scrollHeight - element.clientHeight - element.scrollTop;
            const wasScrolledDown = (distanceToBottom === 0) ? true : false;
            console.log(wasScrolledDown);
        }
    }
}
</script>
