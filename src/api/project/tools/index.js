import { request } from '@/utils/request';

//forecast列表
export const darwdownLog = (params) =>
  request({
    url: 'tools/darwdownLog',
    method: 'get',
    params
  });

// 新增
export const darwdownLogSave = (data) =>
  request({
    url: 'tools/darwdownLogSave',
    method: 'post',
    data
  });

// 编辑
export const darwdownLogChange = (data) =>
  request({
    url: 'tools/darwdownLogChange',
    method: 'post',
    data
  });
