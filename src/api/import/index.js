import { request } from '@/utils/request';

// 项目详情
export const toolsDetail = (params) =>
  request({
    url: 'tools/detail',
    method: 'get',
    params
  });

// 开发成本保存
export const toolsSaveDevCost = (data) =>
  request({
    url: 'tools/saveDevCost',
    method: 'post',
    data
  });

// 添加抵押物
export const toolsAddSecurity = (data) =>
  request({
    url: 'tools/addSecurity',
    method: 'post',
    data
  });

// 进度还款-列表
export const toolsGetBuild = (params) =>
  request({
    url: 'tools/getBuild',
    method: 'get',
    params
  });

// 进度还款-提交
export const toolsSaveBuild = (data) =>
  request({
    url: 'tools/saveBuild',
    method: 'post',
    data
  });

// 地址
export const saveAddr = (data) =>
  request({
    url: 'tools/saveAddr',
    method: 'post',
    data
  });
