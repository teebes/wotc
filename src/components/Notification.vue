<template>
    <div class='ui-notification'
         :class="{error: notification.isError}">

        <div class='notification-background'></div>

        <div class='message'>{{ notification.text}}</div>

        <div class="close-button" aria-label="Close">
            <span aria-hidden="true"
                  @click="$emit('close-notification')">&#10006;</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Notification',
    mounted() {
        if (this.notification.autoHide) {
            setTimeout(() => {
                this.$emit('close-notification');
            }, 3000);
        }
    },
    props: ['notification'],
}
</script>