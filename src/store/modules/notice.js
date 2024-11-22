import { defineStore } from "pinia";
import { getNotices } from "@/api/notice";

const useNoticeStore = defineStore("VcOnlineNoticeDetail", {
  state: () => ({
    noticeList: [],
    noticeDetail: {},
    checkedAll: false,
    showDetail: false
  }),

  actions: {
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
      this.noticeList.forEach((item) => item.checked = flag);
    },
    setShowDetail(flag) {
      this.showDetail = flag;
    },
    getNoticeList(params) {
      return new Promise((resolve, reject) => {
        getNotices(params)
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
