import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {

    map: {
        updated_ts: null,
        rooms: {},
    },

    map_updated_ts: null,

    player_config: {},
    player_aliases: {},
    player_vars: {},

    // Whenever a room message is received, is updated with a mutation
    current_room_data: {},
}

const mutations = {
    updateMap(state) {
        state.map_updated_ts = new Date().getTime()
    },

    setCurrentRoomData(state, room_data) {
        state.current_room_data = room_data
    },

    resetMap(state, new_map) {
        state.map.rooms = new_map
        state.map_updated_ts = new Date().getTime()
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
        state.map_updated_ts = new Date().getTime()
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

        for (const line of mobs) {
            for (const word of line.split(/[\s,\.]+/)) {
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
