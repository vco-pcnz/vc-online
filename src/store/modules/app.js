import { defineStore } from 'pinia';
import { indexPub } from '@/api/system';

const useAppStore = defineStore('VcOnlineAppInfo', {
  state: () => ({
    appName: 'VC Online',
    config: null,
    indexPubLoading: false
  }),

  getters: {
    getState() {
      return { ...this.$state };
    }
  },

  actions: {
    requestAppInfo() {
      if (this.config || this.indexPubLoading) return;
      this.indexPubLoading = true
      indexPub().then((res) => {
        this.config = res;
      }).finally(() => {
        this.indexPubLoading = false
      });
    }
  }
});
export default useAppStore;
