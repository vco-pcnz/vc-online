import { request } from '@/utils/request';

//forecast列表 - open
export const darwdownLog = (params) =>
  request({
    url: 'tools/darwdownLog',
    method: 'get',
    params
  });

// 项目列表 - open
export const darwdownLogSave = (data) =>
  request({
    url: 'tools/darwdownLogSave',
    method: 'post',
    data
  });
