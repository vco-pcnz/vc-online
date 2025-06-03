import { request } from '@/utils/request';

/**
 * 登录
 */
export const dashboard = () =>
  request({
    url: '/home/dashboard',
    method: 'get'
  });
