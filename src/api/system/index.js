import { request } from "@/utils/request";

// 获取城市信息
export const systemCity = (params = {}) =>
  request({
    url: "/system/city/index",
    method: "get",
    params
  });
