<template>
    <div class='console-region'>
        <div class='console' ref="console" @scroll="onScroll">
            <div class='message'>Welcome</div>
            <Message v-for="message in messages"
                     v-bind:message="message" />
        </div>
    </div>
</template>

<script>
import Message from './Message.vue'

function isScrolledDown(element) {
    /*
        Return true if the element's scrollbar is all the way at the bottom.
    */
    const distanceToBottom = (element.scrollHeight
                            - element.clientHeight
                            - element.scrollTop);
    return (distanceToBottom === 0) ? true : false;
}

export default {
    name: 'Console',
    props: ['messages'],
    components: {
        Message
    },
    beforeUpdate() {
        this.wasScrolledDown = isScrolledDown(this.$refs.console);

    },
    updated() {
        if (this.wasScrolledDown) {
            this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
        }
    },
    methods: {
        onScroll(event) {
            // const element = event.target;
            // const distanceToBottom = element.scrollHeight - element.clientHeight - element.scrollTop;
            // const wasScrolledDown = (distanceToBottom === 0) ? true : false;
            // console.log(wasScrolledDown);
        },
    }
}
</script>
