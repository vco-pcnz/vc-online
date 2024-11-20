import VcoAvatar from './vco-avatar/index.vue'
import VcoNumber from './vco-number/index.vue'
import VcoPageNav from './vco-page-nav/index.vue'
import AuthTemplate from './auth/index.vue'

export default {
  install(Vue) {
    Vue.component('VcoAvatar', VcoAvatar)
    Vue.component('VcoNumber', VcoNumber)
    Vue.component('VcoPageNav', VcoPageNav)
    Vue.component('AuthTemplate', AuthTemplate)
  }
}
