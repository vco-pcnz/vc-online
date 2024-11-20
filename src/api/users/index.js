import { request } from "@/utils/request";

// 获取用户信息
export const getUserCenter = () =>
  request({
    url: "/user/center",
    method: "get",
  });
