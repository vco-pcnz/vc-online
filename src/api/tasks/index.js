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


// 其他待办列表
export const backlogOtherList = (params) =>
  request({
    url: "/project/project/backlogOtherList",
    method: "get",
    params
  });
  

// 申请borker
export const applyBroker = (data) =>
  request({
    url: "/stake/vip/applyBroker",
    method: "post",
    data
  });

// 申请borker 详情
export const applyBrokerDetail = () =>
  request({
    url: "/stake/vip/applyBrokerDetail",
    method: "get"
  });

  
