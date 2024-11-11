import Layout from '@/layout/index.vue'

//系统路由
const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/demo',
    children: [
      {
        name: 'home',
        path: '/home',
        component: () => import('@/views/home/index.vue'),
        meta: { title: '首页' }
      }
    ]
  },
  {
    name: 'demo',
    path: '/demo',
    component: () => import('@/views/demo/index.vue'),
    meta: { title: 'demo' }
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录' }
  },
  {
    name: 'register',
    path: '/register',
    component: () => import('@/views/register/index.vue'),
    meta: { title: '注册' }
  },
  {
    path: "/:pathMatch(.*)*",
    hidden: true,
    meta: { title: '页面不存在' },
    component: () => import('@/views/error/404.vue'),
  }
]

export default routes