import { defineStore } from 'pinia';
import { getList, getCategory, getStakeholderType, stakeUnbind, stakeBind, stakeDelete } from '@/api/orgs';
import { systemDictData } from '@/api/system';
import { remove } from 'lodash';

const useOrgsStore = defineStore('VcOnlineOrgs', {
  state: () => ({
    list: [],
    jobs: [],
    stakeholder_job: [],
    stakeholder_job1: [],
    stakeholder_job2: [],
    loading: false,
    category: [], //分类
    stakeholderType: [], // 字典获取code = stakeholder_type
    searchParams: {
      cid: '', //分类id 分类接口查询
      type: '', //字典获取code = stakeholder_type
      key: 'all', // all，id，name，email，mobile，code
      org__name: '',
      keywords: undefined,
      sort__asc: undefined,
      sort__desc: undefined
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
    },
    getCategory() {
      if (this.category.length) return;
      return getCategory().then((res) => {
        this.category = res;
      });
    },
    getStakeholderType() {
      if (this.stakeholderType.length) return;
      return getStakeholderType().then((res) => {
        this.stakeholderType = res.map((item) => {
          return {
            name: item.name,
            code: item.code - 0
          };
        });
      });
    },
    // 解绑用户
    stakeUnbind(uuid) {
      return stakeUnbind({ uuid }).then((res) => {
        this.getList();
      });
    },
    // 绑定用户
    stakeBind(param) {
      return stakeBind(param).then((res) => {
        this.getList();
      });
    },
    // 绑定用户
    getJob(code) {
      this.jobs = this[code];
      if (this[code].length) return;
      return systemDictData(code).then((res) => {
        this[code] = res;
        this.jobs = res;
      });
    },
    // 利益相关者删除
    remove(uuids, isCurrent) {
      this.loading = true;
      return stakeDelete({ uuids })
        .then(() => {
          if (isCurrent) {
            this.getList();
          } else {
            this.setSearchParams({});
          }
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
});
export default useOrgsStore;
