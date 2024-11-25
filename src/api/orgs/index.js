import { request } from "@/utils/request";

// 分类选择
export const getCategory = () =>
  request({
    url: "/stake/category",
    method: "get",
  });

// 列表
export const getList = (data) =>
  request({
    url: "stake/index",
    method: "get",
    data,
  });


// 查询字典
export const getStakeholderTypet = () =>
  request({
    url: "system/dictData/getDictByCode?code=stakeholder_type",
    method: "get"
  });
