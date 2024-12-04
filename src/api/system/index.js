import { request } from "@/utils/request";

// 获取城市信息
export const systemCity = (params = {}) =>
  request({
    url: "/system/city/index",
    method: "get",
    params
  });

// 利益相关者搜索接口
export const stakeSelStake = (params = {}) =>
  request({
    url: "/stake/selStake",
    method: "get",
    params
  });

// 字典
export const systemDictData = (code) =>
  request({
    url: "/system/dictData/getDictByCode?code="+code,
    method: "get"
  });

// 字典
export const systemConfigData = (params) =>
  request({
    url: "system/configData/getConfigByCode",
    method: "get",
    params
  });
