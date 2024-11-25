import VcoAvatar from './vco-avatar/index.vue'
import VcoNumber from './vco-number/index.vue'
import VcoPageNav from './vco-page-nav/index.vue'
import VcoPageTab from './vco-page-tab/index.vue'
import VcoPageSearch from './vco-page-search/index.vue'
import VcoPageSearchItem from './vco-page-search-item/index.vue'
import VcoTypeInput from './vco-type-input/index.vue'
import VcoTableTool from './vco-table-tool/index.vue'
import VcoTableLayoutType from './vco-table-layout-type/index.vue'
import VcoTableSort from './vco-table-sort/index.vue'
import VcoTimeLine from './vco-time-line/index.vue'
import VcoMobileInput from './vco-mobile-input/index.vue'
import AuthTemplate from './auth/index.vue'

export default {
  install(Vue) {
    Vue.component('VcoAvatar', VcoAvatar)
    Vue.component('VcoNumber', VcoNumber)
    Vue.component('VcoPageNav', VcoPageNav)
    Vue.component('VcoPageTab', VcoPageTab)
    Vue.component('VcoPageSearch', VcoPageSearch)
    Vue.component('VcoPageSearchItem', VcoPageSearchItem)
    Vue.component('VcoTypeInput', VcoTypeInput)
    Vue.component('VcoTableTool', VcoTableTool)
    Vue.component('VcoTableLayoutType', VcoTableLayoutType)
    Vue.component('VcoTableSort', VcoTableSort)
    Vue.component('VcoTimeLine', VcoTimeLine)
    Vue.component('VcoMobileInput', VcoMobileInput)
    Vue.component('AuthTemplate', AuthTemplate)
  }
}
