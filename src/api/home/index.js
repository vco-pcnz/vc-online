import { request } from '@/utils/request';

/**
 * 登录
 */
export const dashboard = () =>
  request({
    url: '/home/dashboard',
    method: 'get'
  });

export const myQuick = () =>
  request({
    url: '/home/myQuick',
    method: 'get'
  });

export const quick = (params) =>
  request({
    url: '/home/quick',
    method: 'get',
    params
  });

export const saveMyQuick = (data) =>
  request({
    url: '/home/saveMyQuick',
    method: 'post',
    data
  });
