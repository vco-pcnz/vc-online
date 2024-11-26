import { createRouter, createWebHashHistory, createWebHistory } from 'vue-router'
import { useUserStore, useNoticeStore } from '@/store'
import i18n from "@/i18n";
import NProgress from 'nprogress'
import { getToken } from "@/utils/token-util.js"
import 'nprogress/nprogress.css'
import { getMenuRoutes } from './router-utils'
import routes from './webRouter.js'

const whiteRoute = routes.filter(item => item.name).map(item => item.name)

const title = import.meta.env.VITE_APP_TITLE

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();
  const noticeStore = useNoticeStore()
  NProgress.start()
  let toTitle = to.meta.title || to.name
  document.title = toTitle ? `${i18n.global.t(toTitle)} - ${title}` : title
  const token = getToken()

  // 登录状态下
  if (token) {
    if (to.name === 'login') {
      userStore.logout()
      return
    }

    if (!userStore.userInfo) {
      // 用户信息
      await userStore.requestUserInfo();
      noticeStore.setNoticeCount();
    }

    // 注册动态路由
    if (!userStore.routerInit) {
      const { menus, homePath } = await userStore.requestRouterInfo();
      if (menus) {
        router.addRoute(getMenuRoutes(menus, homePath));
        next({ ...to, replace: true });
        return
      }
    }
    next()
  } else {
    // 未登录的情况下允许访问的路由
    if (!whiteRoute.includes(to.name)) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  }
})

router.afterEach((to, from) => {
  NProgress.done()
})

router.onError(error => {
  NProgress.done();
});


export default router