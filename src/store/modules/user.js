import { defineStore } from 'pinia'
import tool from '@/utils/tool'

const useUserStore = defineStore('VcOnlineUserInfo', {

  state: () => ({
    userInfo: undefined
  }),

  getters: {
    getState() {
      return { ...this.$state }
    },
  },

  actions: {
    setToken(token) {
      tool.local.set(import.meta.env.VITE_APP_TOKEN_PREFIX, token)
    },

    getToken() {
      return tool.local.get(import.meta.env.VITE_APP_TOKEN_PREFIX)
    },

    clearToken() {
      tool.local.remove(import.meta.env.VITE_APP_TOKEN_PREFIX)
    },

    resetUserInfo() {
      this.$reset();
    },

    requestUserInfo() {

    },

    login(form) {
      console.log('login')
      // return loginApi.login(form).then(r => {
      //   this.setToken(r.token)
      //   // 存用户admin_id
      //   localStorage.setItem('ExpressUserId', r.admin_id)

      //   return true
      // }).catch(e => {
      //   console.error(e)
      //   return false
      // })
    },

    async logout() {
      this.clearToken()
      this.resetUserInfo()
    }
  }
})
export default useUserStore