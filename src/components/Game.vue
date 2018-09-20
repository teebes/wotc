<template>
    <div class='game-view'>

        <Map :map="map"
             :current_room_key="current_room_key" />

        <Console :messages="messages" />

        <Input :current_room_data="current_room_data"/>

    </div>
</template>

<script>
import Console from './game/Console.vue'
import Map from './game/Map.vue'
import Input from './game/Input.vue'

export default {
    name: 'Game',
    props: [
        'messages',
        'map',
        'current_room_key',
        'current_room_data',
    ],
    components: {
        Console,
        Input,
        Map,
    }
}
</script>
