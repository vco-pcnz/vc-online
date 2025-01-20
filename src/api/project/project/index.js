import { request } from '@/utils/request';

// 项目列表 - open
export const listProject = (params) =>
  request({
    url: 'project/project/listProject',
    method: 'get',
    params
  });
