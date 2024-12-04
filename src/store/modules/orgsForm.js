import { defineStore } from 'pinia';
import { getChildList, getCategory, getStakeholderTypet, getDetail, stakeUnbind, stakeBind } from '@/api/orgs';

const useOrgsForm = defineStore('VcOnlineOrgsForm', {
  state: () => ({
    p_uuid: '',    
    uuid: '',
    isEdit: false,
    isAddMember:false
  }),
  actions: {
    update(params) {
      Object.keys(params).map(key => {
        this[key] = params[key]
      })
    }
  },
  // 使用插件的配置选项
  persist: {
    key: 'VcOnlineOrgsForm', // 自定义存储的键名
    storage: localStorage // 可以改为 sessionStorage localStorage
    // paths: ['count'] // 只对count进行持久化
  }
});
export default useOrgsForm;
