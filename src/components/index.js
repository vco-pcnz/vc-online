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
import VcoUploadImage from './vco-upload-image/index.vue'
import VcoUploadList from './vco-upload-list/index.vue'
import VcoAddressSelect from './vco-address-select/index.vue'
import AuthTemplate from './auth/index.vue'
import Countdown from './vco-countdown/index.vue'
import VcoUpload from './vco-upload/index.vue'
import VcoUploadModal from './vco-upload-modal/index.vue'
import VcoFileItem from './vco-file-item/index.vue'
import VcoChooseUser from './vco-choose-user/index.vue'
import VcoChooseAddUser from './vco-choose-add-user/index.vue'
import VcoStatus from './vco-status/index.vue'
import VcoProcessTitle from './vco-process-title/index.vue'
import VcoUserItem from './vco-user-item/index.vue'
import VcoPagePanel from './vco-page-panel/index.vue'
import VcoMeter from './vco-meter/index.vue';
import VcoAddress from './vco-address/index.vue';
import VcoConfirmAlert from './vco-confirm-alert/index.vue';

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
    Vue.component('VcoUploadImage', VcoUploadImage)
    Vue.component('VcoUploadList', VcoUploadList)
    Vue.component('VcoAddressSelect', VcoAddressSelect)
    Vue.component('AuthTemplate', AuthTemplate)
    Vue.component('VcoCountdown', Countdown)
    Vue.component('VcoUpload', VcoUpload)
    Vue.component('VcoUploadModal', VcoUploadModal)
    Vue.component('VcoFileItem', VcoFileItem)
    Vue.component('VcoChooseUser', VcoChooseUser)
    Vue.component('VcoChooseAddUser', VcoChooseAddUser)
    Vue.component('VcoStatus', VcoStatus)
    Vue.component('VcoProcessTitle', VcoProcessTitle)
    Vue.component('VcoUserItem', VcoUserItem)
    Vue.component('VcoPagePanel', VcoPagePanel)
    Vue.component('VcoMeter', VcoMeter)
    Vue.component('VcoAddress', VcoAddress)
    Vue.component('VcoConfirmAlert', VcoConfirmAlert)
  }
}
