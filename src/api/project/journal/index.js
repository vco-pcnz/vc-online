import { request } from '@/utils/request';

// 杂项开始申请--新增
export const edit = (data) =>
  request({
    url: 'project/journal/edit',
    method: 'post',
    data
  });

//杂项请求-统计
export const journalStatistics = (params) =>
  request({
    url: 'project/journal/statistics',
    method: 'get',
    params
  });

//杂项请求-列表
export const journal = (params) =>
  request({
    url: 'project/journal/journal',
    method: 'get',
    params
  });

//杂项开始审核同意
export const saveStep = (data) =>
  request({
    url: 'project/journal/saveStep',
    method: 'post',
    data
  });

//杂项开始退回上一步
export const goBack = (data) =>
  request({
    url: 'project/journal/goBack',
    method: 'post',
    data
  });

//杂项开始召回
export const recall = (data) =>
  request({
    url: 'project/journal/recall',
    method: 'post',
    data
  });

//杂项开始拒绝
export const decline = (data) =>
  request({
    url: 'project/journal/decline',
    method: 'post',
    data
  });
