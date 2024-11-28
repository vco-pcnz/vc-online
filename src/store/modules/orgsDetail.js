import { defineStore } from "pinia";
import { getChildList, getCategory, getStakeholderTypet,getDetail } from "@/api/orgs";

const useOrgsDetailStore = defineStore("VcOnlineOrgsDetail", {
  state: () => ({
    detail:null,
    list: [],
    loading: false,
    category: [], //分类
    stakeholderTypet: [], // 字典获取code = stakeholder_type
    searchParams: {
      uuid: "", //利益相关者的
      cid: "", //分类id 分类接口查询
      type: "", //字典获取code = stakeholder_type
      key: "all", // all，id，name，email，mobile，code
      org__name: "",
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
    setDetail(id) {
      return getDetail({id}).then((res) => {
        this.detail = res;
      });
    },
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
    getList(id) {
      if (id) {
        this.searchParams.uuid = id
      }
      const param = this.searchParams;
      const page = this.pagination;
      this.loading = true;
      return new Promise((resolve, reject) => {
        getChildList({
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
      return getCategory().then((res) => {
        this.category = res;
      });
    },
    getStakeholderTypet() {
      return getStakeholderTypet().then((res) => {
        this.stakeholderTypet = res;
      });
    },
  },
});
export default useOrgsDetailStore;
