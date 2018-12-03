<template>
  <div id="app">
    <header>WoTMUD Playground</header>

    <div class="nav">
      <router-link to="/bash">BASH</router-link>
      <router-link to="/stab">STAB</router-link>
    </div>

    <router-view/>
  </div>
</template>

<style lang="scss" scoped>
@import "styles/base.scss";

.nav {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  a {
    //@include font-title;
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
</style>
