import { request } from "@/utils/request";

// 获取模版步骤
export const templateStep = (params) =>
  request({
    url: "/approve/template/step",
    method: "get",
    params
  });

  // 草稿信息
export const projectDraftInfo = (params) =>
  request({
    url: "/project/project/draftInfo",
    method: "get",
    params
  });

// 保存草稿
export const projectSaveSaveDraft = (data) =>
  request({
    url: "/project/project/saveDraft",
    method: "post",
    data
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
  
  // 保存项目信息
export const projectApplySaveProjectInfo = (data) =>
  request({
    url: "/project/apply/saveProjectInfo",
    method: "post",
    data
  });

// 项目信息
export const projectApplyProjectInfo = (params) =>
  request({
    url: "/project/apply/projectInfo",
    method: "get",
    params
  });

// 枚举列表
export const projectSelectList = (params = {}) =>
  request({
    url: "/project/project/selectList",
    method: "get",
    params
  });

// 保存项目资质
export const projectApplySaveProjectCert = (data) =>
  request({
    url: "/project/apply/saveProjectCert",
    method: "post",
    data
  });

// 项目资质
export const projectApplyProjectCert = (params) =>
  request({
    url: "/project/apply/projectCert",
    method: "get",
    params
  });

// 保存借款参数
export const projectApplySaveLoanInfo = (data) =>
  request({
    url: "/project/apply/saveLoanInfo",
    method: "post",
    data
  });

// 借款参数
export const projectApplyLoanInfo = (params) =>
  request({
    url: "/project/apply/loanInfo",
    method: "get",
    params
  });
  
// 申请信息
export const projectApplyApplyInfo = (params) =>
  request({
    url: "/project/apply/applyInfo",
    method: "get",
    params
  });

// 项目详情
export const projectDetailApi = (params) =>
  request({
    url: "/project/project/projectDetail",
    method: "get",
    params
  });

// 取消审核
export const projectApplyCancelCheck = (data) =>
  request({
    url: "/project/apply/cancelCheck",
    method: "post",
    data
  });

// LM 审核详情
export const projectLmAuditDetail = (params) =>
  request({
    url: "/project/audit/lmAuditDetail",
    method: "get",
    params
  });
  