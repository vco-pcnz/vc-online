import VcoAvatar from './vco-avatar/index.vue'
import VcoNumber from './vco-number/index.vue'

export default {
  install(Vue) {
    Vue.component('VcoAvatar', VcoAvatar)
    Vue.component('VcoNumber', VcoNumber)
  }
}
