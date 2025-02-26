import { request } from '@/utils/request';

// 项目列表 - open
export const listProject = (params) =>
  request({
    url: 'project/project/listProject',
    method: 'get',
    params
  });

// open项目详情
export const projectDetail = (params) =>
  request({
    url: 'projectDetail/detail',
    method: 'get',
    params
  });

// open项目详情
export const historyList = (params) =>
  request({
    url: 'projectDetail/historyList',
    method: 'get',
    params
  });

// open项目详情
export const projectDetailClose = (data) =>
  request({
    url: 'projectDetail/close',
    method: 'post',
    data
  });

// 关账审核同意
export const saveStep = (data) =>
  request({
    url: 'projectDetail/saveStep',
    method: 'post',
    data
  });

// 关账退回上一步
export const goBack = (data) =>
  request({
    url: 'projectDetail/goBack',
    method: 'post',
    data
  });
