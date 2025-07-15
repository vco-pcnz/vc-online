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

// Cashflow Export
export const transactions = (params) =>
  request({
    url: 'project/forecast/transactions',
    method: 'get',
    params
  });

// Cashflow Export
export const forecast = (params) =>
  request({
    url: 'project/forecast/forecast',
    method: 'get',
    params
  });

// forecast Export
export const forecastExport = (params) =>
  request({
    url: 'project/forecast/forecastExport',
    method: 'get',
    params
  });

// transactions  Export
export const transactionsExport = (params) =>
  request({
    url: 'project/forecast/transactionsExport',
    method: 'get',
    params
  });

// Performance
export const forecastPerformance = (params) =>
  request({
    url: 'project/forecast/forecastPerformance',
    method: 'get',
    params
  });

// brief
export const forecastBrief = (params) =>
  request({
    url: 'project/forecast/brief',
    method: 'get',
    params
  });
