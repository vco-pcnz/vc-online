import { request } from '@/utils/request';

// 变更请求-列表
export const projectVariationList = (params) =>
  request({
    url: 'project/variation/variation',
    method: 'get',
    params
  });

// 变更退回上一步
export const projectVariationGoback = (data) =>
  request({
    url: 'project/variation/goBack',
    method: 'post',
    data
  });

// 变更拒绝
export const projectVariationDecline = (data) =>
  request({
    url: 'project/variation/decline',
    method: 'post',
    data
  });

// 变更审核同意
export const projectVariationSaveStep = (data) =>
  request({
    url: 'project/variation/saveStep',
    method: 'post',
    data
  });

// 变更-forecast列表
export const projectForecastVaiList = (params) =>
  request({
    url: 'project/variation/forecastVaiList',
    method: 'get',
    params
  });

  // 变更-forecast统计
export const projectVariationStatisticsVai = (params) =>
  request({
    url: 'project/variation/statisticsVai',
    method: 'get',
    params
  });
