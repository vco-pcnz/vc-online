import { defineStore } from "pinia";
import { formatMenus, toTreeData } from '@/router/router-utils'
import { getUserInfo, getMenuList } from "@/api/user";
import { getToken, setToken, removeToken } from "@/utils/token-util.js"
import { login, logout } from "@/api/auth";

const useUserStore = defineStore("VcOnlineUserInfo", {
  state: () => ({
    userInfo: undefined,
    routerInit: false,
    routerInfo: undefined
  }),

  getters: {
    getState() {
      return { ...this.$state };
    },
  },

  actions: {
    setToken(token) {
      setToken(token)
    },

    getToken() {
      getToken()
    },

    clearToken() {
      // removeToken()
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
      result.roles = result.roles && result.roles.length ? result.roles.join('/') : ''
      this.userInfo = result;
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
          idField: 'id',
          parentIdField: 'children'
        }).concat([])
      );
      this.routerInfo = menus;

      this.routerInit = true
      return { menus, homePath };
    },

    login(form) {
      return new Promise((resolve, reject) => {
        login(form).then(r => {
          this.setToken(r.access_token)
          resolve()
        }).catch(e => {
          reject(e)
        })
      })
    },

    async logout() {
      alert('fdsafdsfdsa')
      await logout();
      this.clearToken();
      this.resetUserInfo();
      location.replace(`${window.location.origin}/#/login`);
    },
  },
});
export default useUserStore;
