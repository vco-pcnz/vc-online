import { request } from "@/utils/request";

// 获取模版步骤
export const templateStep = () =>
  request({
    url: "approve/template/step",
    method: "get",
  });
