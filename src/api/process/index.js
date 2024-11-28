import { request } from "@/utils/request";

// 获取模版步骤
export const templateStep = (params) =>
  request({
    url: "/approve/template/step",
    method: "get",
    params
  });

// 保存借款人信息
export const projectApplySaveBorrowerInfo = (data) =>
  request({
    url: "/project/apply/saveBorrowerInfo",
    method: "post",
    data
  });

// 借款人信息
export const projectApplyBorrowerInfo = (params) =>
  request({
    url: "/project/apply/borrowerInfo",
    method: "get",
    params
  });
  

// 项目信息
export const projectApplyProjectInfo = (params) =>
  request({
    url: "/project/apply/projectInfo",
    method: "get",
    params
  });