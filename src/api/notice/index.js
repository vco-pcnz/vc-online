import { request } from "@/utils/request";

// 站内信列表
export const getNoticeList = () =>
  request({
    url: "system/message/index",
    method: "get",
  });

// 信息已读
export const setNoticeRead = (data) =>
  request({
    url: "system/message/read",
    method: "post",
    data,
  });

// 信息已读
export const getUnreadCount = () =>
  request({
    url: "system/message/count",
    method: "get",
  });
