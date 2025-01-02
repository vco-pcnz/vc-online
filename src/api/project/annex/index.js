import { request } from '@/utils/request';

// 文件夹列表
export const getTree = (params) =>
  request({
    url: 'project/annex/index',
    method: 'get',
    params
  });

// 获取当前未认证邮箱验证码
export const sendUnauthECode = (data) =>
  request({
    url: 'user/center/getCodeNowE',
    method: 'post',
    data
  });
