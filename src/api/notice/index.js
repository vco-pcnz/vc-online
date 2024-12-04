import { request } from "@/utils/request";

// 站内信列表
export const getNotices = (params) =>
  request({
    url: "system/message/index",
    method: "get",
    params,
  });

// 信息已读
export const setNoticeRead = (data) =>
  request({
    url: "system/message/read",
    method: "post",
    data,
  });

// 信息未读
export const getUnreadCount = () =>
  request({
    url: "index/count",
    method: "get",
  });

// 全部已读
export const setAllRead = (params) =>
  request({
    url: "system/message/readAll",
    method: "get",
    params,
  });

// 站内信详情
export const getNoticeDetail = (params) =>
  request({
    url: "system/message/info",
    method: "get",
    params,
  });
