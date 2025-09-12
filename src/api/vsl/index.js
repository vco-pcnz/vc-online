import { request } from "@/utils/request";

// 进件--建立费、建立费率计算
export const establishCalculate = (data) =>
  request({
    url: "/project/audit/establishCalculate",
    method: "post",
    data
  });
