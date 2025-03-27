import { defineStore } from 'pinia';
import { productSel } from '@/api/process';

const useProductStore = defineStore('VcOnlineProductData', {
  state: () => ({
    productData: []
  }),

  getters: {
    getState() {
      return { ...this.$state };
    }
  },

  actions: {
    requestProductInfo() {
      productSel().then(res => {
        const data = res || []
        this.productData = data

        console.log('data', data);
      })
    },
    getProductUuid(code) {
      const obj = this.productData.find(item => item.code === code)
      return obj ? obj.uuid : ''
    }
  }
});
export default useProductStore;
