import { defineStore } from "pinia";
import { getUserCenter } from "@/api/profile";

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
    setUserDetail(data) {
      this.userDetail = data;
    },
    getUserInfo(data) {
      return new Promise((resolve, reject) => {
        getUserCenter(data)
          .then((r) => {
            this.setUserDetail(r);
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
