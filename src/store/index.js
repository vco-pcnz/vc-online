import { createPinia } from 'pinia'
import useUserStore from './modules/user'
import useAppStore from './modules/app'
import useUserDetailStore from './modules/userDetail'

const pinia = createPinia()

export {
  useUserStore,
  useAppStore,
  useUserDetailStore
}
export default pinia
