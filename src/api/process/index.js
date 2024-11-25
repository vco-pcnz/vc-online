import { request } from "@/utils/request";

// 获取模版步骤
export const templateStep = (params) =>
  request({
    url: "approve/template/step",
    method: "get",
    params
  });
