<template>
  <div id="app">
    <header>WoTMUD Playground</header>

    <div class="nav">
      <router-link to="/bash">BASH</router-link>
      <router-link to="/stab">STAB</router-link>
      <router-link to="/charge">CHARGE</router-link>
      <router-link to="/kick">KICK</router-link>
      <router-link to="/who">WHO</router-link>
    </div>

    <router-view class="playground-page"/>
  </div>
</template>

<style lang="scss">
@import "styles/base.scss";

#app {
  height: 100%;
  display: flex;
  flex-direction: column;

  .nav {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    a {
      padding: 0 5px;
      color: $color-text-hex-50;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
      &.router-link-active {
        color: $color-text;
        //color: $color-secondary;
        &:hover {
          text-decoration: none;
        }
      }
      &:not(:last-child) {
        margin-right: 5px;
      }
      &:not(:first-child) {
        margin-left: 5px;
      }
    }
  }

  .playground-page {
    flex-grow: 1;
  }
}
</style>
