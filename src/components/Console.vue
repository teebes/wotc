<template>
    <div>
        <div class='console-region'>
            <div class='console' ref="console" @scroll="onScroll">
                <div class='message'>Welcome</div>
                <Message v-for="message in messages"
                         v-bind:message="message" />
            </div>
        </div>
        <div class='scroll-tool-region'>
            <div v-if="scrollDistanceToBottom > 0"
                 class='scroll-tool-view'>
                <div class='new-messages'
                     @click="jump">JUMP TO BOTTOM</div>
            </div>
        </div>
    </div>
</template>

<script>
import Message from './Message.vue'

function getDistanceToBottom(element) {
    return element.scrollHeight
            - element.clientHeight
            - element.scrollTop;
}

function isScrolledDown(element) {
    /*
        Return true if the element's scrollbar is all the way at the bottom.
    */
    return (getDistanceToBottom(element) === 0) ? true : false;
}

export default {
    name: 'Console',
    props: ['messages'],
    data() {
        return {
            scrollDistanceToBottom: 0,
        }
    },
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
            this.scrollDistanceToBottom = getDistanceToBottom(event.target);
        },
        jump(event) {
            this.$refs.console.scrollTop = this.$refs.console.scrollHeight;
        },
    }
}
</script>
