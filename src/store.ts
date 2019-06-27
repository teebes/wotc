import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    hide_frame: false
  },
  mutations: {
    hide_frame: state => {
      state.hide_frame = true;
    },

    show_frame: state => {
      state.hide_frame = false;
    }
  },
  actions: {}
});
