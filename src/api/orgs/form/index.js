import { request } from '@/utils/request';

// 获取当前未认证邮箱验证码
export const sendUnauthECode = data =>
  request({
    url: 'stake/getCodeNowE',
    method: 'post',
    data,
  });

// 获取老邮箱验证码
export const sendCodeOldE = params =>
  request({
    url: 'stake/getCodeE',
    method: 'post',
    params,
  });

// 获取新邮箱验证码
export const sendCodeNewE = data =>
  request({
    url: 'stake/getCodeNewE',
    method: 'post',
    data,
  });

// 用户邮箱变更提交
export const changeEmail = data =>
  request({
    url: 'stake/change',
    method: 'post',
    data,
  });

// 获取老手机验证码
export const sendCodeOldM = params =>
  request({
    url: 'stake/getCodeM',
    method: 'post',
    params,
  });

// 获取新手机验证码
export const sendCodeNewM = data =>
  request({
    url: 'stake/getCodeNewM',
    method: 'post',
    data,
  });

// 获取当前未认证手机号验证码
export const sendUnauthCodeM = data =>
  request({
    url: 'stake/getCodeNowM',
    method: 'post',
    data,
  });

// 用户手机变更提交
export const changeMobile = data =>
  request({
    url: 'stake/change',
    method: 'post',
    data,
  });


  
// 提交
export const stakeAdd = data =>
  request({
    url: 'stake/add',
    method: 'post',
    data,
  });


// 提交
export const stakeEdit = data =>
  request({
    url: 'stake/edit',
    method: 'post',
    data,
  });


