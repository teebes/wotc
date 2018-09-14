<template>
    <div class='game-view'>
        <div class='corner-map-region'></div>
        <div class='console-region'>
            <div class='console'>
                <div class='message'
                     v-for="message in messages"
                     v-bind:message="message">
                    <div>{{ message.text }}</div>
                </div>
            </div>
        </div>
        <div class='input-region'></div>
    </div>
</template>

<script>
export default {
    name: 'Game',
    props: ['messages']
}
</script>
