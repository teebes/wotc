<template>
    <div class='game-view'>
        <Map/>
        <Console/>
        <Input/>
    </div>
</template>

<script>
import Console from './game/Console.vue'
import Map from './game/Map.vue'
import Input from './game/Input.vue'

export default {
    name: 'Game',
    components: {
        Console,
        Input,
        Map,
    }
}
</script>
