import { request } from '@/utils/request';

// 反洗钱列表
export const getWash = (params) =>
  request({
    url: 'project/wash/index',
    method: 'get',
    params
  });

// 反洗钱列表 - 详情用
export const projectDetailGetWash = (params) =>
  request({
    url: 'projectDetail/washList',
    method: 'get',
    params
  });

// 新增编辑
export const washAdd = (data) =>
  request({
    url: 'project/wash/add',
    method: 'post',
    data
  });

// 反洗钱-删除
export const washRemove = (data) =>
  request({
    url: 'project/wash/delete',
    method: 'post',
    data
  });

// 反洗钱-新增
export const sendSms = (data) =>
  request({
    url: 'project/wash/sendSms',
    method: 'post',
    data
  });

// 反洗钱-重命名
export const sendEmail = (data) =>
  request({
    url: 'project/wash/sendEmail',
    method: 'post',
    data
  });

// 反洗钱-删除
export const washCheck = (data) =>
  request({
    url: 'project/wash/check',
    method: 'post',
    data
  });

// 新增编辑
export const detailAdd = (data) =>
  request({
    url: 'project/wash/wedit',
    method: 'post',
    data
  });

// 添加和修改反洗钱
export const applyWash = (params) =>
  request({
    url: 'project/wash/applyWash',
    method: 'get',
    params
  });

// 反洗钱审核同意
export const wsaveStep = (data) =>
  request({
    url: 'project/wash/wsaveStep',
    method: 'post',
    data
  });

// 反洗钱拒绝
export const wdecline = (data) =>
  request({
    url: 'project/wash/wdecline',
    method: 'post',
    data
  });

// 跟新反洗钱人员
export const washUpdate = (params) =>
  request({
    url: 'project/wash/update',
    method: 'get',
    params
  });