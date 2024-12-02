import { request } from '@/utils/request';

// 分类选择
export const getCategory = () =>
  request({
    url: '/stake/category',
    method: 'get',
  });

// 列表
export const getList = params =>
  request({
    url: 'stake/index',
    method: 'get',
    params,
  });

// 查询字典
export const getStakeholderTypet = () =>
  request({
    url: 'system/dictData/getDictByCode?code=stakeholder_type',
    method: 'get',
  });

// 详情
export const getDetail = params =>
  request({
    url: 'stake/info',
    method: 'get',
    params,
  });

// 子列表
export const getChildList = params =>
  request({
    url: 'stake/child/list',
    method: 'get',
    params,
  });

  // 解绑用户
  export const stakeUnbind = params =>
    request({
      url: 'stake/unbind',
      method: 'post',
      params,
    });

    // 解绑用户
    export const stakeBind = params =>
      request({
        url: 'stake/bind',
        method: 'post',
        params,
      });
    
  
