import { defineStore } from 'pinia';
import { getNotices, setNoticeRead, setAllRead, getNoticeDetail, getUnreadCount } from '@/api/notice';

const useNoticeStore = defineStore('VcOnlineNoticeDetail', {
  state: () => ({
    noticeCount: 0,
    noticeList: [],
    noticeDetail: {},
    checkedAll: false,
    showDetail: false,
    searchParams: {
      sta: 0, // 0All 1System 2Business
      key: 'all', // all，unread，already
      keywords: undefined,
      sort__asc: undefined,
      sort__desc: undefined
    },
    pagination: {
      page: 1,
      limit: 10
    },
    total: 0,
    intervalId: null
  }),
  getters: {
    selectedNoticeIds: (state) => {
      return state.noticeList.filter((item) => item.checked).map((item) => item.id);
    }
  },
  actions: {
    setNoticeSearchParams(data) {
      this.searchParams = {
        ...this.searchParams,
        ...data
      };
    },
    setNoticeList(data) {
      this.noticeList = data;
    },
    setNoticeCheck() {
      const length = this.noticeList.filter((item) => item.checked).length;
      this.checkedAll = length === this.noticeList.length;
    },
    setAllNoticeCheck(flag) {
      this.checkedAll = flag;
      this.noticeList.forEach((item) => (item.checked = flag));
    },
    setShowDetail(flag) {
      this.showDetail = flag;
    },
    setAllRead() {
      setAllRead({ sta: this.searchParams.sta }).then(() => {
        this.getNoticeList();
        this.setNoticeCount();
      });
    },
    setPaginate(page, limit) {
      this.pagination = {
        page,
        limit
      };
    },
    setNoticeCount() {
      getUnreadCount().then((res) => (this.noticeCount = res));
    },
    startPolling(time) {
      this.intervalId = setInterval(this.setNoticeCount, time);
    },
    stopPolling() {
      if (this.intervalId) {
        clearInterval(this.intervalId); // 清除定时器
        this.intervalId = null;
      }
    },
    updateNoticeStatus(data) {
      return new Promise((resolve, reject) => {
        setNoticeRead(data)
          .then(() => {
            this.getNoticeList();
            this.setNoticeCount();
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    getNoticeList() {
      const param = this.searchParams;
      const page = this.pagination;
      return new Promise((resolve, reject) => {
        getNotices({
          ...param,
          ...page
        })
          .then((res) => {
            this.setNoticeList(res.data);
            this.total = res.count;
            resolve(res.data);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    getNoticeDetail(id) {
      const { sta } = this.searchParams;
      getNoticeDetail({ id, sta }).then((res) => {
        this.noticeDetail = res;
        if (!res.look) {
          this.updateNoticeStatus({ ids: [id] });
        }
      });
    }
  }
});
export default useNoticeStore;
