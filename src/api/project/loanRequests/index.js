import { request } from '@/utils/request';

//放款&还款请求-列表
export const projectLoan = (params) =>
  request({
    url: 'project/loan/index',
    method: 'get',
    params
  });

//变更请求-列表
export const projectVariation = (params) =>
  request({
    url: 'project/variation/index',
    method: 'get',
    params
  });

//解押&抵押物申请请求-列表
export const projectDischarge = (params) =>
  request({
    url: 'project/discharge/index',
    method: 'get',
    params
  });

//解押&抵押物申请请求-列表
export const applyIndex = (params) =>
  request({
    url: 'project/discharge/applyIndex',
    method: 'get',
    params
  });
  
//解押&抵押物申请请求-列表
export const applyEditIndex = (params) =>
  request({
    url: 'project/discharge/applyEditIndex',
    method: 'get',
    params
  });

//平账请求-列表
export const projectJournal = (params) =>
  request({
    url: 'project/journal/index',
    method: 'get',
    params
  });

//放款&罚息请求-列表
export const projectPenalty = (params) =>
  request({
    url: 'project/penalty/index',
    method: 'get',
    params
  });

//关账&取消关账请求-列表
export const closeIndex = (params) =>
  request({
    url: 'projectDetail/closeIndex',
    method: 'get',
    params
  });

//反洗钱请求-列表
export const projectWash = (params) =>
  request({
    url: 'project/wash/applyIndex',
    method: 'get',
    params
  });

//成为中介请求-列表
export const brokerIndex = (params) =>
  request({
    url: 'stake/vip/brokerIndex',
    method: 'get',
    params
  });

//所有请求分类数量
export const requestNum = (params) =>
  request({
    url: 'project/request/num',
    method: 'get',
    params
  });
