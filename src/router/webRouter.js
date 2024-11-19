import Layout from "@/layout/index.vue";

//系统路由
const routes = [
  {
    path: "/",
    component: Layout,
    redirect: "/home",
    children: [
      {
        name: "home",
        path: "/home",
        component: () => import("@/views/home/index.vue"),
        meta: { title: "首页" },
      },
      {
        name: "users",
        path: "/users",
        component: () => import("@/views/users/index.vue"),
        meta: { title: "用户" },
      },
      {
        name: "profile",
        path: "/profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "个人信息" },
        children: [
          {
            name: "edit-profile",
            path: "about",
            component: () => import("@/views/profile/components/edit-profile.vue")
          },
          {
            name: "change-pwd",
            path: "safe",
            component: () => import("@/views/profile/components/change-pwd.vue"),
          },
          {
            name: "notice",
            path: "notice",
            component: () => import("@/views/profile/components/notice.vue"),
          },
        ],
      },
    ],
  },
  {
    name: "demo",
    path: "/demo",
    component: () => import("@/views/demo/index.vue"),
    meta: { title: "demo" },
  },
  {
    name: "login",
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { title: "登录" },
  },
  {
    name: "register",
    path: "/register",
    component: () => import("@/views/register/index.vue"),
    meta: { title: "注册" },
  },
  {
    name: "password-reset",
    path: "/password-reset",
    component: () => import("@/views/login/components/PasswordReset.vue"),
    meta: { title: "密码重置" },
  },
  {
    name: "register-broker",
    path: "/register-broker",
    component: () => import("@/views/register/components/register-broker.vue"),
    meta: { title: "成为中介" },
  },
  {
    path: "/:pathMatch(.*)*",
    hidden: true,
    meta: { title: "页面不存在" },
    component: () => import("@/views/error/404.vue"),
  },
];

export default routes;
