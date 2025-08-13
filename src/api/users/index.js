import { request } from '@/utils/request';
// 用户列表
export const getUserList = (params) =>
  request({
    url: 'user/index',
    method: 'get',
    params
  });

// 添加用户
export const addUser = (data) =>
  request({
    url: 'user/add',
    method: 'post',
    data
  });

// 编辑用户
export const editUser = (data) =>
  request({
    url: 'user/edit',
    method: 'post',
    data
  });

// 用户角色-选择
export const getRoles = (params) =>
  request({
    url: 'role/sel',
    method: 'get',
    params
  });

export const assignRole = (data) =>
  request({
    url: 'user/setRoles',
    method: 'post',
    data
  });

// 获取用户详情
export const getUserInfo = (params) =>
  request({
    url: 'user/info',
    method: 'get',
    params
  });

// 用户关系搜索
export const getRelation = (params) =>
  request({
    url: 'user/relation',
    method: 'get',
    params
  });

// 关系同意
export const relationAgree = (data) =>
  request({
    url: 'user/relationAgree',
    method: 'post',
    data
  });

// 关系删除 type 1 父级
export const relationDel = (data) =>
  request({
    url: 'user/relationDel',
    method: 'post',
    data
  });

// 具体用户搜索
export const relationUser = (params) =>
  request({
    url: 'user/relationUser',
    method: 'get',
    params
  });

// 关系删除
export const relationApply = (data) =>
  request({
    url: 'user/relationApply',
    method: 'post',
    data
  });

// 获取用户列表数据
export const getUserSelUser = (params) =>
  request({
    url: 'user/selUser',
    method: 'get',
    params,
  });

// 获取用户列表数据 - 下级
export const getUserRelation = (params) =>
  request({
    url: 'user/relation',
    method: 'get',
    params,
  });


export const assignProject = (data) =>
  request({
    url: 'user/setProject',
    method: 'post',
    data
  });