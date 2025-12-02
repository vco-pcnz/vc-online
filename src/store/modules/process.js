import { defineStore } from "pinia";

const useProcessStore = defineStore("processStore", {
  state: () => ({
    // 当前项目是否已有预测列表
    hasForcast: false,
    bocForcastDone: false,
    bocRemainInfo: {
      vsRemainMoney: 0,
      bocRemainMoney: 0,
      loanRemainMoney: 0
    }
  }),

  getters: {
    getState() {
      return { ...this.$state };
    },
  },

  actions: {
    setForcastState(flag) {
      this.hasForcast = flag
    },
    setBocRemainInfo(data) {
      this.bocRemainInfo = data
    },
    setBocForcastDone(flag) {
      this.bocForcastDone = flag
    }
  }
});
export default useProcessStore;
