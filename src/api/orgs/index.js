import { request } from '@/utils/request';

// 分类选择
export const getCategory = () =>
  request({
    url: '/stake/category',
    method: 'get'
  });

// 列表
export const getList = (params) =>
  request({
    url: 'stake/index',
    method: 'get',
    params
  });

// 查询字典
export const getStakeholderType = () =>
  request({
    url: 'system/dictData/getDictByCode?code=stakeholder_type',
    method: 'get'
  });

// 详情
export const getDetail = (params) =>
  request({
    url: 'stake/info',
    method: 'get',
    params
  });

// 子列表
export const getChildList = (params) =>
  request({
    url: 'stake/child/list',
    method: 'get',
    params
  });

// 解绑用户
export const stakeUnbind = (params) =>
  request({
    url: 'stake/unbind',
    method: 'post',
    params
  });

// 解绑用户
export const stakeBind = (params) =>
  request({
    url: 'stake/bind',
    method: 'post',
    params
  });

// 组织列表
export const stakeOrgList = (params) =>
  request({
    url: 'stake/orgList',
    method: 'get',
    params
  });

// 添加组织
export const stakeOrgAdd = (data) =>
  request({
    url: 'stake/orgAdd',
    method: 'post',
    data
  });

// 编辑组织
export const stakeOrgEdit = (data) =>
  request({
    url: 'stake/orgEdit',
    method: 'post',
    data
  });

// 组织删除
export const stakeOrgDel = (data) =>
  request({
    url: 'stake/orgDel',
    method: 'post',
    data
  });

// 人员关系同步
export const stakeChildMebSync = (params) =>
  request({
    url: 'stake/child/mebSync',
    method: 'get',
    params
  });

  
// 利益相关者删除
export const stakeDelete = (data) =>
  request({
    url: 'stake/delete',
    method: 'post',
    data
  });
  
  // 跟新组织树
  export const updateShareholdingTree = (data) =>
    request({
      url: 'stake/updateShareholdingTree',
      method: 'post',
      data
    });