import { request } from '@/utils/request';

// Update forecast 汇总（Cashflow forecast 入口）
export const forecastUpdSummary = (params) =>
  request({
    url: 'project/forecastUpd/summary',
    method: 'get',
    params
  });

// Update forecast 贷款列表
export const forecastUpdIndex = (params) =>
  request({
    url: 'project/forecastUpd/index',
    method: 'get',
    params
  });

// Confirm 前预览改动
export const forecastUpdPreview = (params) =>
  request({
    url: 'project/forecastUpd/preview',
    method: 'get',
    params
  });

// 编辑草稿（add / update / delete / lock / push / lender）
export const forecastUpdEdit = (data) =>
  request({
    url: 'project/forecastUpd/edit',
    method: 'post',
    data
  });

// Auto-spread 开关
export const forecastUpdAutoSpread = (data) =>
  request({
    url: 'project/forecastUpd/autoSpread',
    method: 'post',
    data
  });

// 平均摊分到到期日
export const forecastUpdSpreadEvenly = (data) =>
  request({
    url: 'project/forecastUpd/spreadEvenly',
    method: 'post',
    data
  });

// 放弃草稿
export const forecastUpdDiscard = (data) =>
  request({
    url: 'project/forecastUpd/discard',
    method: 'post',
    data
  });

// Confirm（写回草稿并记录复核）
export const forecastUpdConfirm = (data) =>
  request({
    url: 'project/forecastUpd/confirm',
    method: 'post',
    data
  });
