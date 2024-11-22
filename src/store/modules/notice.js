import { defineStore } from "pinia";
import { getNotices, setNoticeRead } from "@/api/notice";

const useNoticeStore = defineStore("VcOnlineNoticeDetail", {
  state: () => ({
    noticeList: [],
    noticeDetail: {},
    checkedAll: false,
    showDetail: false,
    searchParams: {
      sta: 0, // 0All 1System 2Business
      key: "all", // all，unread，already
      keywords: undefined,
      sort__asc: undefined,
      sort__desc: undefined,
    },
  }),
  getters: {
    selectedNoticeIds: (state) => {
      return state.noticeList
        .filter((item) => item.checked)
        .map((item) => item.id);
    },
  },
  actions: {
    setNoticeSearchParams(data) {
      this.searchParams = {
        ...this.searchParams,
        ...data,
      };
    },
    setNoticeList(data) {
      this.noticeList = data;
    },
    setNoticeDetail(data) {
      this.noticeDetail = data;
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
    updateNoticeStatus(data) {
      return new Promise((resolve, reject) => {
        setNoticeRead(data)
          .then(() => {
            this.getNoticeList();
            resolve();
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
    getNoticeList() {
      const param = this.searchParams;
      return new Promise((resolve, reject) => {
        getNotices(param)
          .then((r) => {
            this.setNoticeList(r);
            resolve(r);
          })
          .catch((e) => {
            reject(e);
          });
      });
    },
  },
});
export default useNoticeStore;
