import { request } from "@/utils/request";

// 获取模版步骤
export const templateStep = (params) =>
  request({
    url: "/approve/template/step",
    method: "get",
    params
  });

// 获取具体流程步骤
export const projectApproveStep = (params) =>
  request({
    url: "/project/project/approveStep",
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

// 取消项目
export const applyCancelProject = (data) =>
  request({
    url: "/project/apply/cancelProject",
    method: "post",
    data
  });

// 取消审核
export const projectApplyCancelCheck = (data) =>
  request({
    url: "/project/apply/cancelCheck",
    method: "post",
    data
  });

// 拒绝项目
export const projectAuditDeclineProject = (data) =>
  request({
    url: "/project/audit/declineProject",
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
  
// LM 审核Check
export const lmAuditStatus = (data) =>
  request({
    url: "/project/audit/lmAuditStatus",
    method: "post",
    data
  });

// 审核-保存借款人信息
export const projectAuditSaveBorrowerInfo = (data) =>
  request({
    url: "/project/audit/saveBorrowerInfo",
    method: "post",
    data
  });

// 审核-保存项目信息
export const projectAuditSaveProjectInfo = (data) =>
  request({
    url: "/project/audit/saveProjectInfo",
    method: "post",
    data
  });

// 审核-保存项目资质
export const projectAuditSaveProjectCert = (data) =>
  request({
    url: "/project/audit/saveProjectCert",
    method: "post",
    data
  });

// 审核-保存借款参数
export const projectAuditSaveLoanInfo = (data) =>
  request({
    url: "/project/audit/saveLoanInfo",
    method: "post",
    data
  });

// 项目列表
export const projectListApi = (params) =>
  request({
    url: "/project/project/projectList",
    method: "get",
    params
  });

// 获取补充信息
export const getApproveTemp = (params) =>
  request({
    url: "/approve/template/supplement",
    method: "get",
    params
  });
  
// 获取基础财务字段
export const ruleCredit = () =>
  request({
    url: "/rule/credit",
    method: "get"
  });

// 获取申请项目财务字段数值
export const creditInfo = (params) =>
  request({
    url: "/project/credit/info",
    method: "get",
    params
  });

// 提交申请项目财务字段
export const creditInitial = (data) =>
  request({
    url: "/project/credit/initial",
    method: "post",
    data
  });

// 预测放款数据darwdown
export const projectForecastDarwDownList = (params) =>
  request({
    url: "/project/forecast/darwDownList",
    method: "get",
    params
  });

// 获取预测放款数据Forecast
export const projectForecastIndex = (params) =>
  request({
    url: "/project/forecast/index",
    method: "get",
    params
  });

// darwdown添加追加数据
export const projectForecastAdd = (data) =>
  request({
    url: "/project/forecast/add",
    method: "post",
    data
  });

// 删除预测放款数据Forecast
export const projectForecastDelete = (data) =>
  request({
    url: "/project/forecast/delete",
    method: "post",
    data
  });

// 关联用户-系统配置
export const associateSystemConfig = () =>
  request({
    url: "/project/associate/systemConfig",
    method: "get"
  });

// 关联用户-关联列表
export const associateUserList = (params) =>
  request({
    url: "/project/associate/userList",
    method: "get",
    params
  });

// 关联用户-数据提交
export const associateAssignUser = (data) =>
  request({
    url: "/project/associate/assignUser",
    method: "post",
    data
  });

// 审核记录
export const auditHistoryList = (params) =>
  request({
    url: "/project/audit/historyList",
    method: "get",
    params
  });
  
