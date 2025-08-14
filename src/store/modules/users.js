import { defineStore } from 'pinia';
import { getUserList, getRoles } from '@/api/users';

const useUsersStore = defineStore('VcOnlineUsers', {
  state: () => ({
    userList: [],
    roleList: [],
    loading: false,
    searchParams: {
      type: undefined, // 0全部 1机构 2个人
      role_id: undefined,
      role_cid: undefined,
      key: 'all', // all，id，name，email，mobile，code
      keywords: undefined,
      org__name: '',
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
      this.searchParams = {
        ...this.searchParams,
        ...data
      };
      this.pagination.page = 1;
      this.getUserList();
    },
    setPaginate(page, limit) {
      this.pagination = {
        page,
        limit
      };
      this.getUserList();
    },
    getUserList() {
      const param = this.searchParams;
      const page = this.pagination;
      this.loading = true;
      return new Promise((resolve, reject) => {
        getUserList({
          ...param,
          ...page
        })
          .then((r) => {
            this.userList = r.data;
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
    getRoleList() {
      return getRoles().then((res) => {
        this.roleList = res;
      });
    }
  }
});
export default useUsersStore;
