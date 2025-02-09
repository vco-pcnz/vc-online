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

// 放款召回
export const loanDrecall = (data) =>
  request({
    url: 'project/loan/drecall',
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

// 放款退回上一步
export const loanDgoBack = (data) =>
  request({
    url: 'project/loan/dgoBack',
    method: 'post',
    data
  });
