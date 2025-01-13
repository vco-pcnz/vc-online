import { request } from '@/utils/request';

// Cashflow forecast
export const cashFlowForecast = (params) =>
  request({
    url: 'project/forecast/cashFlowForecast',
    method: 'get',
    params
  });

// Cashflow forecast
export const managerList = (params) =>
  request({
    url: 'project/forecast/managerList',
    method: 'get',
    params
  });

// Cashflow forecast
export const forecastProjectList = (params) =>
  request({
    url: 'project/forecast/forecastProjectList',
    method: 'get',
    params
  });

// Cashflow forecast
export const monthlyCashFlowList = (params) =>
  request({
    url: 'project/forecast/monthlyCashFlowList',
    method: 'get',
    params
  });

// Cashflow forecast
export const cashFlowList = (params) =>
  request({
    url: 'project/forecast/cashFlowList',
    method: 'get',
    params
  });

// Forecast  Export
export const cashFlowForecastExport = (params) =>
  request({
    url: 'project/forecast/cashFlowForecastExport',
    method: 'get',
    params
  });

// Cashflow Export
export const cashFlowListExport = (params) =>
  request({
    url: 'project/forecast/cashFlowListExport',
    method: 'get',
    params
  });
