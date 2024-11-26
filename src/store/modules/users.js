import { defineStore } from 'pinia';
import { getUserList, getRoles } from '@/api/users';

const useUsersStore = defineStore('VcOnlineUsers', {
  state: () => ({
    userList: [],
    roleList: [],
    searchParams: {
      sta: 0, // 0全部 1机构 2个人
      role_id: undefined,
      key: 'all', // all，id，name，email，mobile，code
      keywords: undefined,
      org__name: '',
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
      this.searchParams = {
        ...this.searchParams,
        ...data,
      };
      this.getUserList();
    },
    setPaginate(page, limit) {
      this.pagination = {
        page,
        limit,
      };
      this.getUserList();
    },
    getUserList() {
      const param = this.searchParams;
      const page = this.pagination;
      return new Promise((resolve, reject) => {
        getUserList({
          ...param,
          ...page,
        })
          .then((r) => {
            this.userList = r.data;
            this.total = r.count;
            resolve(r.data);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    getRoleList() {
      return getRoles().then(res => {
        this.roleList = res;
      });
    }
  },
});
export default useUsersStore;
