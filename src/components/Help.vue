<template>
<div class='single-page wot-help'>

    <div class='title-banner'>
        <div class='page-title'>
            <h1>The Wheel of Time MUD Web Client</h1>
        </div>

        <div class='close-icon'><span @click="$emit('close-help')" class='close-icon'>&#10006;</span></div>

    </div>

    <p>The Wheel of Time MUD is a text-based game primarily played via telnet at <span class='color-primary'>game.wotmud.org</span> port <span class='color-primary'>2224</span>.</p>

    <p>This page offers a way to play it right here on your browser, using a websocket - telnet proxy. The websocket connection is encrypted, and we do not store passwords.</p>

    <p>If you have questions, please ask them on Discord here: <a href='https://discord.gg/bEmMrPy'>https://discord.gg/bEmMrPy</a> or via direct messages to Thibaud#1067.</p>

    <h2>Quick Tips</h2>

    <ul>

        <li>In order for the map to work, you must have brief mode <strong>OFF</strong>. You can use the <strong class='color-secondary'>#brief</strong> command to hide room descriptions via the client.</li>

        <li>To repeat the last command, hit the Enter key without anything in the input bar.</li>

        <li>To enter a blank line (for example when looking at the who list or chests), enter '\'</li>

        <li>You can define aliases with the <strong class='cmd'>#alias</strong> command, allowing you chain multi-line operations with semicolons, for example: <span class='cmd'>#alias bb hide ; backstab dark</span></li>

        <li>You can define variables with the <strong class='cmd'>#var</strong> command, for example: <span class='cmd'>#var opp human</span>. Combined with <span class='cmd'>#alias x kill h.@opp</span>, 'x' would now output 'kill h.human'.</li>

    </ul>

</div>
</template>

<script>
export default {
    name: 'Help'
}
</script>