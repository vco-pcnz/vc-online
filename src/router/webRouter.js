//系统路由
const routes = [
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
    name: "verify",
    path: "/verify",
    component: () => import("@/views/verify/index.vue"),
    meta: { title: "校验" },
  },
  {
    name: "register",
    path: "/register",
    component: () => import("@/views/register/index.vue"),
    meta: { title: "注册" },
  },
  {
    name: "forgot-password",
    path: "/forgot-reset",
    component: () => import("@/views/login/components/ForgotPassword.vue"),
    meta: { title: "忘记密码" },
  },
  {
    name: "password-reset",
    path: "/invite",
    component: () => import("@/views/login/components/ResetPassword.vue"),
    meta: { title: "密码重置" },
  },
  {
    name: "register-broker",
    path: "/register-broker",
    component: () => import("@/views/register/components/register-broker.vue"),
    meta: { title: "成为中介" },
  },
  {
    name: "wash",
    path: "/wash",
    component: () => import("@/views/wash/index.vue"),
    meta: { title: "AML Review" },
  },
  {
    path: "/403",
    hidden: true,
    meta: { title: "" },
    component: () => import("@/views/error/403.vue"),
  },
  {
    path: "/:pathMatch(.*)*",
    hidden: true,
    meta: { title: "" },
    component: () => import("@/views/error/404.vue"),
  },
];

export default routes;
