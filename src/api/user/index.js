import { request } from "@/utils/request";

// 获取用户信息
export const getUserInfo = (params) =>
  request({
    url: "/index/getUserInfo",
    method: "get",
    params
  });

// 获取用户菜单
export const getMenuList = (params) =>
  request({
    url: "index/getMenuList",
    method: "get",
    params
  });
