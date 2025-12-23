import { defineStore } from 'pinia';
import { productSel } from '@/api/process';

const useProductStore = defineStore('VcOnlineProductData', {
  state: () => ({
    productData: [],
    openProductData: [],
    currentProduct: ''
  }),

  getters: {
    getState() {
      return { ...this.$state };
    }
  },

  actions: {
    async requestProductInfo() {
      await productSel().then((res) => {
        const data = res || [];
        this.productData = data;
        this.openProductData = data.filter((item) => item.status);
        if (this.openProductData.find((item) => item.uuid === localStorage.getItem('currentProduct'))) {
          this.currentProduct = localStorage.getItem('currentProduct');
        } else {
          this.currentProduct = this.openProductData[0].uuid;
        }
        localStorage.setItem('currentProduct', this.currentProduct);
      });
    },
    getProductUuid(code) {
      const obj = this.productData.find((item) => item.code === code);
      return obj ? obj.uuid : '';
    }
  }
});
export default useProductStore;
