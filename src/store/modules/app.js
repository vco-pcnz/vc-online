import { defineStore } from 'pinia';
import { indexPub } from '@/api/system';

const useAppStore = defineStore('VcOnlineAppInfo', {
  state: () => ({
    appName: 'VC Online',
    config: null
  }),

  getters: {
    getState() {
      return { ...this.$state };
    }
  },

  actions: {
    requestAppInfo() {
      if (this.config) return;
      indexPub().then((res) => {
        this.config = res;
      });
    }
  }
});
export default useAppStore;
