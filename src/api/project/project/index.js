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
export const projectDetailClose = (params) =>
  request({
    url: 'projectDetail/close',
    method: 'post',
    params
  });
