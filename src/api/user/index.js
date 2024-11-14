import request from "@/utils/request";

// 获取用户信息
export const getUserInfo = () =>
  request({
    url: "/index/getUserInfo",
    method: "get",
  });

// 获取用户菜单
export const getMenuList = () =>
  request({
    url: "index/getMenuList",
    method: "get",
  });
