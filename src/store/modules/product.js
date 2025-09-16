import { defineStore } from 'pinia';
import { productSel } from '@/api/process';

const useProductStore = defineStore('VcOnlineProductData', {
  state: () => ({
    productData: [],
    openProductData: [],
  }),

  getters: {
    getState() {
      return { ...this.$state };
    }
  },

  actions: {
    async requestProductInfo() {
      await productSel().then(res => {
        const data = res || []
        this.productData = data
        this.openProductData = data.filter(item => item.status)
      })
    },
    getProductUuid(code) {
      const obj = this.productData.find(item => item.code === code)
      return obj ? obj.uuid : ''
    }
  }
});
export default useProductStore;
