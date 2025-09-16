import { request } from '@/utils/request';

export const investList = (params) =>
  request({
    url: '/invest/index',
    method: 'get',
    params
  });

export const investEdit = (data) =>
  request({
    url: 'invest/edit',
    method: 'post',
    data
  });

export const bindUser = (data) =>
  request({
    url: 'invest/bindUser',
    method: 'post',
    data
  });

export const bindProject = (data) =>
  request({
    url: 'invest/bindProject',
    method: 'post',
    data
  });

export const scheduleEdit = (data) =>
  request({
    url: 'invest/schedule/edit',
    method: 'post',
    data
  });

export const scheduleList = (params) =>
  request({
    url: 'invest/schedule/index',
    method: 'get',
    params
  });

export const scheduleInfo = (params) =>
  request({
    url: 'invest/info',
    method: 'get',
    params
  });

export const scheduleStatistics = (params) =>
  request({
    url: 'invest/schedule/statistics',
    method: 'get',
    params
  });

export const scheduleExportExcel = (params) =>
  request({
    url: 'invest/schedule/exportExcel',
    method: 'get',
    params
  });

export const projectList = (params) =>
  request({
    url: 'invest/projectList',
    method: 'get',
    params
  });

export const investBindData = (params) =>
  request({
    url: '/invest/bindData',
    method: 'get',
    params
  });

export const userProject = (params) =>
  request({
    url: '/invest/userProject',
    method: 'get',
    params
  });

export const dashboard = (params) =>
  request({
    url: '/invest/dashboard',
    method: 'get',
    params
  });

export const statistics = (params) =>
  request({
    url: '/invest/statistics',
    method: 'get',
    params
  });

export const forecastProjectList = (params) =>
  request({
    url: '/invest/forecastProjectList',
    method: 'get',
    params
  });

export const cashFlowForecast = (params) =>
  request({
    url: '/invest/cashFlowForecast',
    method: 'get',
    params
  });

export const monthlyCashFlowList = (params) =>
  request({
    url: '/invest/monthlyCashFlowList',
    method: 'get',
    params
  });

export const barSta = (params) =>
  request({
    url: '/invest/barSta',
    method: 'get',
    params
  });

export const addAmount = (data) =>
  request({
    url: 'invest/addAmount',
    method: 'post',
    data
  });

export const cashFlowForecastExport = (params) =>
  request({
    url: 'invest/cashFlowForecastExport',
    method: 'get',
    params
  });