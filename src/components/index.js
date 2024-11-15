import VcoAvatar from './vco-avatar/index.vue'
import VcoNumber from './vco-number/index.vue'
import AuthTemplate from './auth/index.vue'

export default {
  install(Vue) {
    Vue.component('VcoAvatar', VcoAvatar)
    Vue.component('VcoNumber', VcoNumber)
    Vue.component('AuthTemplate', AuthTemplate)
  }
}
