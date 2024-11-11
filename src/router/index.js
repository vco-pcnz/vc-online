import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import i18n from '@/i18n/index.js'
// import { useUserStore } from '@/store'
import NProgress from 'nprogress'
// import tool from '@/utils/tool'
import 'nprogress/nprogress.css'

import routes from './webRouter.js'

const title = import.meta.env.VITE_APP_TITLE
const defaultRoutePath = '/'
const whiteRoute = ['login', 'register']

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  // const userStore = useUserStore()
  let toTitle = to.meta.title ? i18n.global.t(to.meta.title) : to.name
  document.title = `${toTitle} - ${title}`
  // const token = tool.local.get(import.meta.env.VITE_APP_TOKEN_PREFIX)
  next()
  // 登录状态下
  // if (token) {
  //   if (to.name === 'login') {
  //     next({ path: defaultRoutePath })
  //     return
  //   }

  //   if (!userStore.userInfo && userStore.userInfo == undefined ) {
  //     // 用户信息
  //     await userStore.requestUserInfo()

  //     // 获取路由信息
  //     if (!userStore.routerInit) {
  //       await userStore.requestRouterInfo()
  //     }

  //     next({ path: to.path, query: to.query })
  //   } else {
  //     next()
  //   }
  // } else {
  //   // 未登录的情况下允许访问的路由
  //   if (!whiteRoute.includes(to.name)) {
  //     next({ name: 'login', query: { redirect: to.fullPath } })
  //   } else {
  //     next()
  //   }
  // }
})

router.afterEach((to, from) => {
  NProgress.done()
})

router.onError(error => {
  console.log(error)
  NProgress.done();
});


export default router