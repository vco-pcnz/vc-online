import { request } from "@/utils/request";

// 获取待办列表 - 进件
export const requestBacklogList = (params) =>
  request({
    url: "/project/project/requestBacklogList",
    method: "get",
    params
  });

// 获取待办列表 - open 后
export const projectBacklogList = (params) =>
  request({
    url: "/project/project/backlogList",
    method: "get",
    params
  });

// 待办数量
export const projectBacklogCount = () =>
  request({
    url: "/project/project/backlogCount",
    method: "get"
  });
