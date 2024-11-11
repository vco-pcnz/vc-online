import { defineStore } from 'pinia'

const useAppStore = defineStore('VcOnlineAppInfo', {

  state: () => ({
    appName: 'VC Online'
  }),

  getters: {
    getState() {
      return { ...this.$state }
    },
  },

  actions: {
    requestAppInfo() {

    }
  }
})
export default useAppStore