import { defineStore } from 'pinia';
import { getList } from '@/api/orgs';

const useCloseProjectsStore = defineStore('VcOnlineCloseProjects', {
  state: () => ({
    list: [],
    loading: false,
    searchParams: {
      keywords: undefined
    },
    total: 0,
    pagination: {
      page: 1,
      limit: 10
    }
  }),
  actions: {
    setSearchParams(data) {
      this.pagination.page = 1;
      this.searchParams = {
        ...this.searchParams,
        ...data
      };
      this.getList();
    },
    setPaginate(page, limit) {
      this.pagination = {
        page,
        limit
      };
      this.getList();
    },
    getList() {
      this.list = [
        {
          id: 1,
          project: '项目1',
          borrower: {
            avatar: '',
            name: 'Youd Limited',
          },
          maturity: '2022-01-01',
          irr: '5.5%',
          income: '1820000',
          undrawn: '434422',
          balance: '1538764',
          facility2: '1820000',
          upd: '11',
        },
        {
          id: 2,
          project: 'TEST 0315',
          borrower: {
            avatar: '',
            name: 'vicensh',
          },
          maturity: '2022-01-01',
          irr: '5.5%',
          income: '13600',
          undrawn: '85685',
          balance: '45822',
          facility2: '325500',
        },
      ]
      return
      const param = this.searchParams;
      const page = this.pagination;
      this.loading = true;
      return new Promise((resolve, reject) => {
        getList({
          ...param,
          ...page
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
    }
  }
});
export default useCloseProjectsStore;
