import { defineStore } from 'pinia';
import { getList, getCategory, getStakeholderTypet } from '@/api/orgs';

const useOrgsStore = defineStore('VcOnlineOrgs', {
  state: () => ({
    list: [],
    loading: false,
    category: [], //分类
    stakeholderTypet: [], // 字典获取code = stakeholder_type
    searchParams: {
      cid: '', //分类id 分类接口查询
      type: '', //字典获取code = stakeholder_type
      key: 'all', // all，id，name，email，mobile，code
      org__name: '',
      keywords: undefined,
      sort__asc: undefined,
      sort__desc: undefined,
    },
    total: 0,
    pagination: {
      page: 1,
      limit: 10,
    },
  }),
  actions: {
    setSearchParams(data) {
      this.pagination.page = 1;
      this.searchParams = {
        ...this.searchParams,
        ...data,
      };
      this.getList();
    },
    setPaginate(page, limit) {
      this.pagination = {
        page,
        limit,
      };
      this.getList();
    },
    getList() {
      const param = this.searchParams;
      const page = this.pagination;
      this.loading = true;
      return new Promise((resolve, reject) => {
        getList({
          ...param,
          ...page,
        })
          .then((r) => {
            this.list = r.data;
            this.total = r.count;
            this.loading = false;
            resolve(r.data);
          })
          .catch((e) => {
            this.loading = false;
            reject(e);
          });
      });
    },
    getCategory() {
      if (this.category.length) return;
      return getCategory().then((res) => {
        this.category = res;
      });
    },
    getStakeholderTypet() {
      if (this.stakeholderTypet.length) return;
      return getStakeholderTypet().then((res) => {
        this.stakeholderTypet = res.map((item) => {
          return {
            name: item.name,
            code: item.code - 0,
          };
        });
      });
    },
  },
});
export default useOrgsStore;
