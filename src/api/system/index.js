import { request } from '@/utils/request';

// 获取城市信息
export const systemCity = (params = {}) =>
  request({
    url: '/system/city/index',
    method: 'get',
    params
  });

// 利益相关者搜索接口
export const stakeSelStake = (params = {}) =>
  request({
    url: '/stake/selStake',
    method: 'get',
    params
  });

// 字典
export const systemDictData = (code) =>
  request({
    url: '/system/dictData/getDictByCode?code=' + code,
    method: 'get'
  });

// 字典
export const systemDictDataApi = (params) =>
  request({
    url: "/system/dictData/getDictByCode",
    method: "get",
    params
  });

// 
export const systemConfigData = (params) =>
  request({
    url: 'system/configData/getConfigByCode',
    method: 'get',
    params
  });

// 新西兰地址搜索接口
export const systemCitySearch = (params) =>
  request({
    url: 'system/city/search',
    method: 'get',
    params
  });

// 新西兰地址搜索接口二段
export const systemCitySearchInfo = (params) =>
  request({
    url: 'system/city/searchInfo',
    method: 'get',
    params
  });

// 获取系统公共信息
export const indexPub = (params) =>
  request({
    url: 'index/pub',
    method: 'get',
    params
  });

// 获取图片历史
export const attach = (params) =>
  request({
    url: 'system/attach/index',
    method: 'get',
    params
  });

// 意见反馈
export const feedback = (data) =>
  request({
    url: 'index/feedback',
    method: 'post',
    data
  });

// 意见反馈
export const versionList = (params) =>
  request({
    url: 'index/versionList',
    method: 'get',
    params
  });
