import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    hide_frame: false,
    color_blue: "0, 231, 255"
  },
  mutations: {
    hide_frame: state => {
      state.hide_frame = true;
    },

    show_frame: state => {
      state.hide_frame = false;
    },

    blue_color_set: (state, rgba) => {
      state.color_blue = rgba;
    }
  },
  actions: {}
});
