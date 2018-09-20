<template>
    <div class='header'>

        <div class='inner'>
            <div class='logo'>
                <a href='https://writtenrealms.com/'>
                    <img src='../assets/logo-black.svg' class='logo-badge'/>
                </a>
            </div>

            <div class='world-name color-text-50'>
                <a href='http://wotmud.org' class='font-title'>The Wheel of Time MUD</a>
                <img @click="$emit('show-help')" src='../assets/help_icon_2x.png' class='help-icon'/>
            </div>
        </div>

    </div>
</div>

</template>

<script>

export default {
    name: 'Header'
}
</script>

<style lang="scss" scoped>
.header {

    background-color: #131217;

    height: 80px;
    width: 100%;
    flex-shrink: 0;

    .inner {
        width: 100%;
        max-width: 950px;
        margin: 0 auto;

        height: 100%;

        display: flex;
        align-items: center;

        .logo {
            flex: 1 0;
            display: flex;
            justify-content: center;

            img.logo-badge { width: 30px; }
        }

        .world-name {
            font-size: 18px;

            flex: 2 0;
            display: flex;
            justify-content: center;

            a {
                color: #808080;
                text-decoration: none;
                font-weight: 700;
            }

            .help-icon {
                width: 16px;
                height: 15px;
                &:hover { cursor: pointer; }
            }

            img.help-icon {
                margin-left: 5px;
            }
        }
    }
}
</style>
