import { request } from '@/utils/request';

// 放款请求-列表
export const loanDrawdown = (params) =>
  request({
    url: 'project/loan/drawdown',
    method: 'get',
    params
  });

// 放款申请--新增
export const loanDedit = (data) =>
  request({
    url: 'project/loan/dedit',
    method: 'post',
    data
  });

// 放款数据统计
export const loanDstatistics = (params) =>
  request({
    url: 'project/loan/dstatistics',
    method: 'get',
    params
  });

// 还款数据统计
export const loanRstatistics = (params) =>
  request({
    url: 'project/loan/rstatistics',
    method: 'get',
    params
  });

// 还款申请--新增
export const loanRDedit = (data) =>
  request({
    url: 'project/loan/redit',
    method: 'post',
    data
  });

// 还款申请-列表
export const loanRepayment = (params) =>
  request({
    url: 'project/loan/repayment',
    method: 'get',
    params
  });

// lm修改实际还款金额
export const loanRchange = (data) =>
  request({
    url: 'project/loan/rchange',
    method: 'post',
    data
  });

// 预测放款数据darwdown
export const forecastDarwdown = (params) =>
  request({
    url: 'project/forecast/darwdown',
    method: 'get',
    params
  });

// lm修改实际放款金额
export const loanDchange = (data) =>
  request({
    url: 'project/loan/dchange',
    method: 'post',
    data
  });

// lm选择darwdown
export const loanDsel = (data) =>
  request({
    url: 'project/loan/dsel',
    method: 'post',
    data
  });

// 放款审核同意
export const loanDsaveStep = (data) =>
  request({
    url: 'project/loan/dsaveStep',
    method: 'post',
    data
  });

// 还款审核同意
export const loanRsaveStep = (data) =>
  request({
    url: 'project/loan/rsaveStep',
    method: 'post',
    data
  });

// 放款召回
export const loanDrecall = (data) =>
  request({
    url: 'project/loan/drecall',
    method: 'post',
    data
  });

// 还款款召回
export const loanRrecall = (data) =>
  request({
    url: 'project/loan/rrecall',
    method: 'post',
    data
  });

// 放款拒绝
export const loanDdeclinel = (data) =>
  request({
    url: 'project/loan/ddecline',
    method: 'post',
    data
  });

// 还款款拒绝
export const loanRdeclinel = (data) =>
  request({
    url: 'project/loan/rdecline',
    method: 'post',
    data
  });

// 放款退回上一步
export const loanDgoBack = (data) =>
  request({
    url: 'project/loan/dgoBack',
    method: 'post',
    data
  });

// 还款退回上一步
export const loanRgoBack = (data) =>
  request({
    url: 'project/loan/rgoBack',
    method: 'post',
    data
  });

// forecast darwDown列表
export const darwdownLog = (params) =>
  request({
    url: 'project/forecast/darwdownLog',
    method: 'get',
    params
  });

// forecast darwDown列表
export const addf = (data) =>
  request({
    url: 'project/forecast/addf',
    method: 'post',
    data
  });

// forecast darwDown列表
export const dsaveStake = (data) =>
  request({
    url: 'project/loan/dsaveStake',
    method: 'post',
    data
  });

// 解押数据统计
export const dischargeStatistics = (params) =>
  request({
    url: 'project/discharge/statistics',
    method: 'get',
    params
  });

// 解押-列表
export const dischargeSecurity = (params) =>
  request({
    url: 'project/discharge/security',
    method: 'get',
    params
  });

// 解押-申请提交
export const dischargeEdit = (data) =>
  request({
    url: 'project/discharge/edit',
    method: 'post',
    data
  });

// 解押-同意申请
export const dischargeSaveStep = (data) =>
  request({
    url: 'project/discharge/saveStep',
    method: 'post',
    data
  });

// 解押-召回申请
export const dischargeRecall = (data) =>
  request({
    url: 'project/discharge/recall',
    method: 'post',
    data
  });

// 解押-退回
export const dischargeGoback = (data) =>
  request({
    url: 'project/discharge/goBack',
    method: 'post',
    data
  });

// 全额还款金额试算
export const projectLoanAllRepayment = (params) =>
  request({
    url: 'project/loan/allRepayment',
    method: 'get',
    params
  });

// 获取项目变更财务字段数值
export const projectCreditVariation = (params) =>
  request({
    url: 'project/credit/variation',
    method: 'get',
    params
  });

// 获取项目变更财务字段数值
export const projectVariationEdit = (data) =>
  request({
    url: 'project/variation/edit',
    method: 'post',
    data
  });