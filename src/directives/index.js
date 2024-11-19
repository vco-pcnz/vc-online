import copy from './copy/index'
import focus from './focus/index'
import permission from './permission/index'


export default {
  install (Vue) {
    Vue.directive('copy', copy)
    Vue.directive('focus', focus)
    Vue.directive('permission', permission)
  }
}
