import { request } from '@/utils/request';

// 文件夹列表
export const getTree = (params) =>
  request({
    url: 'project/annex/index',
    method: 'get',
    params
  });

// 文件夹文件列表
export const getChild = (params) =>
  request({
    url: 'project/annex/child',
    method: 'get',
    params
  });

// 文件夹新增编辑
export const edit = (data) =>
  request({
    url: 'project/annex/edit',
    method: 'post',
    data
  });

// 文件夹-删除
export const annexRemove = (data) =>
  request({
    url: 'project/annex/delete',
    method: 'post',
    data
  });

// 文件-新增
export const fadd = (data) =>
  request({
    url: 'project/annex/fadd',
    method: 'post',
    data
  });


// 文件-重命名
export const frename = (data) =>
  request({
    url: 'project/annex/frename',
    method: 'post',
    data
  });

// 文件-删除
  export const fdel = (data) =>
    request({
      url: 'project/annex/fdel',
      method: 'post',
      data
    });
  
// 文件-移动
export const fmove = (data) =>
  request({
    url: 'project/annex/fmove',
    method: 'post',
    data
  });

// 文件-复制
export const fcopy = (data) =>
  request({
    url: 'project/annex/fcopy',
    method: 'post',
    data
  });

// 文件夹-选择
export const annexSel = (params) =>
  request({
    url: 'project/annex/sel',
    method: 'get',
    params
  });

  // 文件夹-选择
  export const annexEdit = (data) =>
    request({
      url: 'project/annex/edit',
      method: 'post',
      data
    });
  