import { defineStore } from "pinia";
import { formatMenus, toTreeData } from "@/router/router-utils";
import { getUserInfo, getMenuList } from "@/api/user";
import { getToken, setToken, removeToken } from "@/utils/token-util.js";
import { login, logout, getSelectUsers } from "@/api/auth";
import { projectBacklogCount } from "@/api/tasks"
import router from "@/router";

function extractPaths(routes) {
  const result = [];

  function traverse(routeList) {
    routeList.forEach(route => {
      if (route.path) {
        result.push(route.path);
      }
      if (Array.isArray(route.children)) {
        traverse(route.children);
      }
    });
  }

  traverse(routes);
  return result;
}


const useUserStore = defineStore("VcOnlineUserInfo", {
  state: () => ({
    userInfo: undefined,
    routerInit: false,
    routerInfo: undefined,
    routerPaths: [],
    // 当前登录用户的权限
    authorities: [],
    // 是否为普通用户
    isNormalUser: false,
    taskInfo: {
      project: 0,
      request: 0,
      total: 0,
      other: 0
    }
  }),

  getters: {
    getState() {
      return { ...this.$state };
    },
  },

  actions: {
    setToken(token) {
      setToken(token);
    },

    getToken() {
      getToken();
    },

    clearToken() {
      removeToken();
    },

    resetUserInfo() {
      this.$reset();
    },

    async requestUserInfo() {
      const result = await getUserInfo().catch(() => {});
      if (!result) {
        return {};
      }
      // 用户信息
      result.roles =
        result.roles && result.roles.length ? result.roles.join("/") : "";
      this.userInfo = result;
      
      this.isNormalUser = Number(result.ptRole)

      // 用户权限
      this.authorities = result.permissionList;
    },

    getTaskNumInfo() {
      projectBacklogCount().then(res => {
        this.taskInfo = {
          project: res.project_backlog_count || 0,
          request: res.request_backlog_count || 0,
          total: res.total_backlog_count || 0,
          other: res.other_backlog_count || 0
        }
      })
    },

    async requestRouterInfo() {
      const result = await getMenuList().catch(() => {});
      if (!result) {
        console.error("get menus error: ", result);
        return {};
      }

      // 用户菜单, 过滤掉按钮、权限目录、接口类型并转为 children 形式
      const { menus, homePath } = formatMenus(
        toTreeData({
          data: result.filter((d) => ![1, 2, 4].includes(d.menuType)),
          idField: "id",
          parentIdField: "children",
        }).concat([])
      );
      this.routerInfo = menus;
      this.routerPaths = extractPaths(menus)
      this.routerInit = true;
      return { menus, homePath };
    },

    // 判断有没有某个路由
    hasRouteInfo(route) {
      const obj = this.routerPaths.find(item => item === route)
      return obj ? true : false
    },

    login(data) {
      return new Promise((resolve, reject) => {
        login(data)
          .then((r) => {
            r.access_token && this.setToken(r.access_token);
            resolve(r);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    loginBySelectUser(data) {
      return new Promise((resolve, reject) => {
        getSelectUsers(data)
          .then((r) => {
            this.setToken(r.access_token);
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    async logout() {
      if (router.currentRoute.value.name !== 'login') {
        await logout();
        this.clearToken();
        this.resetUserInfo();
        location.replace(`${window.location.origin}/#/login`);
      }
    }
  }
});
export default useUserStore;
