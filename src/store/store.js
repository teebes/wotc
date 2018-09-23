import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {

    map: {
        updated_ts: null,
        rooms: {},
    },

    current_room_data: {},

    messages: [],
    message_counter: 1,

    // Perhaps soon:
    // player_config: {},
    // player_aliases: {},
    // player_vars: {},
}

const mutations = {
    updateMap(state) {
        state.map.updated_ts = new Date().getTime()
    },

    setCurrentRoomData(state, room_data) {
        state.current_room_data = room_data
    },

    resetMap(state, new_map) {
        state.map.rooms = new_map
        state.map.updated_ts = new Date().getTime()
    },

    addToMap(state, rooms) {
        // rooms should be in the form
        // {
        //     room.1: {},
        //     room.2: {},
        // }

        for (const key in rooms) {
            state.map.rooms[key] = rooms[key]
        }
        state.map.updated_ts = new Date().getTime()
    },

    addMessage(state, message) {
        // Construct a message key with ts + message number
        message.mkey = new Date().getTime() + '-' + state.message_counter
        state.messages.push(message)
        const length = state.messages.length,
              max_length = 200
        if (state.messages.length > 200) {
            state.messages.splice(0, length - max_length)
        }
        state.message_counter += 1
    },

    clearMessages(state) {
        state.messages = []
    }
}

const getters = {
    roomKeywords: state => {
        // Keywords to skip
        const excludeWords = [
            'a', 'the', 'an', 'of', 'for', 'on', 'is', 'here', 'with',
        ]
        // Final result
        const keywords = []
        const mobs = state.current_room_data.mobs || []
        const items = state.current_room_data.items || []
        const things = mobs.concat(items)

        for (const line of things) {
            for (let word of line.split(/[\s,\.]+/)) {
                if (!word) continue

                word = word.toLowerCase()
                if (!excludeWords.includes(word))
                    keywords.push(word)
            }
        }

        // TODO: sort by some priority

        return keywords
    }
}

export default new Vuex.Store({
    state,
    mutations,
    getters,
})
