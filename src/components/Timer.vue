<template>
<div id="timer-region">
    <div class='timer-view'>
        {{ minutes }}:{{ seconds }}
    </div>
</div>
</template>

<script>
export default {
    name: 'Timer',
    data() {
        return {
            minutes: 0,
            seconds: '00',
        }
    },
    mounted() {
        const tstart = new Date();

        // init timer
        const intervalId = setInterval(() => {
            const seconds_since = Math.round((new Date() - tstart) / 1000)
            const minutes = Math.floor(seconds_since / 60)
            let seconds = seconds_since - minutes * 60

            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            this.minutes = minutes
            this.seconds = seconds
        }, 1000)

        this.$once('hook:beforeDestroy', function() {
            clearInterval(intervalId)
        })
    }
}
</script>
