import { request } from '@/utils/request';

// 罚息开始申请--新增
export const sedit = (data) =>
  request({
    url: 'project/penalty/sedit',
    method: 'post',
    data
  });
  
//罚息请求-列表
export const penalty = (params) =>
  request({
    url: 'project/penalty/penalty',
    method: 'get',
    params
  });


//罚息开始审核同意
export const ssaveStep = (data) =>
  request({
    url: 'project/penalty/ssaveStep',
    method: 'post',
    data
  });


//罚息开始退回上一步
export const sgoBack = (data) =>
  request({
    url: 'project/penalty/sgoBack',
    method: 'post',
    data
  });

//罚息开始召回
export const srecall = (data) =>
  request({
    url: 'project/penalty/srecall',
    method: 'post',
    data
  });

//罚息开始拒绝
export const sdecline = (data) =>
  request({
    url: 'project/penalty/sdecline',
    method: 'post',
    data
  });

// 结束流程
  
//罚息结束申请--新增
export const eedit = (data) =>
  request({
    url: 'project/penalty/eedit',
    method: 'post',
    data
  });


//罚息结束审核同意
export const esaveStep = (data) =>
  request({
    url: 'project/penalty/esaveStep',
    method: 'post',
    data
  });


//罚息结束退回上一步
export const egoBack = (data) =>
  request({
    url: 'project/penalty/egoBack',
    method: 'post',
    data
  });

//罚息结束召回
export const erecall = (data) =>
  request({
    url: 'project/penalty/erecall',
    method: 'post',
    data
  });

//罚息结束拒绝
export const edecline = (data) =>
  request({
    url: 'project/penalty/edecline',
    method: 'post',
    data
  });