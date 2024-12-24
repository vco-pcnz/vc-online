import { defineStore } from "pinia";

const useProcessStore = defineStore("processStore", {
  state: () => ({
    // 当前项目是否已有预测列表
    hasForcast: false
  }),

  getters: {
    getState() {
      return { ...this.$state };
    },
  },

  actions: {
    setForcastState(flag) {
      this.hasForcast = flag
    }
  }
});
export default useProcessStore;
