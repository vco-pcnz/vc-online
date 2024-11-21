import { defineStore } from "pinia";
import { getUserCenter } from "@/api/users";

const useUserDetailStore = defineStore("VcOnlineUserDetail", {
  state: () => ({
    userDetail: {},
  }),

  getters: {
    getState() {
      return { ...this.$state };
    },
  },

  actions: {
    getUserInfo(data) {
      return new Promise((resolve, reject) => {
        getUserCenter(data)
          .then((r) => {
            this.userDetail = r;
            resolve(r);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
  },
});
export default useUserDetailStore;
