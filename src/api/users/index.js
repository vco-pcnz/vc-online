import { request } from '@/utils/request';
// 用户列表
export const getUserList = (params) =>
  request({
    url: 'user/index',
    method: 'get',
    params,
  });

// 添加用户
export const addUser = (data) =>
  request({
    url: 'user/add',
    method: 'post',
    data,
  });

// 编辑用户
export const editUser = (data) =>
  request({
    url: 'user/edit',
    method: 'post',
    data,
  });

// 用户角色-选择
export const getRoles = (params) =>
  request({
    url: 'role/sel',
    method: 'get',
    params,
  });

export const assignRole = (data) =>
  request({
    url: 'user/setRoles',
    method: 'post',
    data,
  });

// 获取用户详情
export const getUserInfo = (params) =>
  request({
    url: 'user/info',
    method: 'get',
    params,
  });
