import { request } from "@/utils/request";

// 获取待办列表
export const getTasksList = (params) =>
  request({
    url: "/project/project/backlogList",
    method: "get",
    params
  });