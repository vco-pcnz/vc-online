import request from '@/utils/request';

/**
 * 登录
 */
export const login = (data) =>
  request({
    url: '/login',
    method: 'post',
    data
  });

/**
 * 注册
 */
// export const getCaptcha = () =>
//   request({
//     url: '/captcha',
//     method: 'get'
//   });
