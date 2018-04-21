import Vue from 'vue'
import _ from 'lodash'

const state = {
  extractedLocation: '',
  name: 'My Cool IG',
  version: '1.0.0',
  packageAuthor: 'Jan Jansen',
  authorEmail: 'jan@example.com',
  description: 'This is a pretty awesome IG from the the one and only, Jan Jansen',
  conformanceResources: {},
  instances: {}
}

const mutations = {
  SET_EXTRACTED_LOCATION (state, payload) {
    state.extractedLocation = payload.location
  },
  SET_NAME (state, payload) {
    state.name = payload.name
  },
  SET_VERSION (state, payload) {
    state.version = payload.version
  },
  SET_PACKAGE_AUTHOR (state, payload) {
    state.packageAuthor = payload.author
  },
  SET_AUTHOR_EMAIL (state, payload) {
    state.authorEmail = payload.email
  },
  SET_DESCRIPTION (state, payload) {
    state.description = payload.description
  },
  ADD_CONFORMANCE_RESOURCE (state, payload) {
    Vue.set(state.conformanceResources, payload.url, {type: payload.type, name: payload.name, url: payload.url})
  },
  DROP_CONFORMANCE_RESOURCES (state) {
    state.conformanceResources = {}
  }
}

const getters = {
  profilesCount (state) {
    return _.size(_.filter(state.conformanceResources, ['type', 'profile']))
  },
  profilesResources (state) {
    return _.filter(state.conformanceResources, ['type', 'profile'])
  },
  terminologyCount (state) {
    return _.size(_.filter(state.conformanceResources, ['type', 'terminology']))
  },
  terminologyResources (state) {
    return _.filter(state.conformanceResources, ['type', 'terminology'])
  }
}

const actions = {
  // someAsyncTask ({ commit }) {
  //   // do something async
  //   commit('INCREMENT_MAIN_COUNTER')
  // }
}

export default {
  state,
  mutations,
  actions,
  getters
}
