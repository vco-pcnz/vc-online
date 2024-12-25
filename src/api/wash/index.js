import { request } from '@/utils/request';

//反洗钱上传
export const wash = (data) =>
  request({
    url: 'wash',
    method: 'post',
    data
  });

// 反洗钱检查
export const washCode = (params) =>
  request({
    url: 'washCode',
    method: 'get',
    params
  });
