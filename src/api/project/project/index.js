import { request } from '@/utils/request';

// 项目列表 - open
export const listProject = (params) =>
  request({
    url: 'project/project/listProject',
    method: 'get',
    params
  });

// open项目详情
export const projectDetail = (params) =>
  request({
    url: 'projectDetail/detail',
    method: 'get',
    params
  });

// open项目详情
export const historyList = (params) =>
  request({
    url: 'projectDetail/historyList',
    method: 'get',
    params
  });

// open项目详情
export const projectDetailClose = (data) =>
  request({
    url: 'projectDetail/close',
    method: 'post',
    data
  });

// 关账审核同意
export const saveStep = (data) =>
  request({
    url: 'projectDetail/saveStep',
    method: 'post',
    data
  });

// 关账退回上一步
export const goBack = (data) =>
  request({
    url: 'projectDetail/goBack',
    method: 'post',
    data
  });

// 修改借款人信息 - open 后
export const projectDetailSaveBorrower = (data) =>
  request({
    url: 'projectDetail/saveBorrower',
    method: 'post',
    data
  });

// 修改担保人信息 - open 后
export const projectDetailSaveGuarantor = (data) =>
  request({
    url: 'projectDetail/saveGuarantor',
    method: 'post',
    data
  });

// 修改开发成本
export const saveDevCost = (data) =>
  request({
    url: 'projectDetail/saveDevCost',
    method: 'post',
    data
  });

// 项目详情 - 预售列表
export const projectDischargeSales = (params) =>
  request({
    url: 'project/discharge/sales',
    method: 'get',
    params
  });

// 项目详情 - 预售 - 编辑
export const projectDischargeSalesSave = (data) =>
  request({
    url: 'project/discharge/salesSave',
    method: 'post',
    data
  });

// 项目详情 - 预售 - 编辑
export const kpiList = (params) =>
  request({
    url: 'projectDetail/kpiList',
    method: 'get',
    params
  });

// 同步账单数据
export const syncProjectBill = (data) =>
  request({
    url: 'project/project/syncProjectBill',
    method: 'post',
    data
  });

export const downGs = () =>
  request({
    url: 'project/down/gs',
    method: 'get'
  });

export const downSc = (params) =>
  request({
    url: 'project/down/sc',
    method: 'get',
    params
  });

// 预算-预测表-重置-生成预测表
export const scheduleSaveTemp = (data) =>
  request({
    url: '/project/down/scheduleSaveTemp',
    method: 'post',
    data
  });

// 预算-预测表-重置
export const projectDownSchedule = (data) =>
  request({
    url: '/project/down/schedule',
    method: 'post',
    data
  });

export const downBl = (params) =>
  request({
    url: 'project/down/bl',
    method: 'get',
    params
  });

// 项目列表 - open
export const umbreListProject = (params) =>
  request({
    url: 'umbre/projectList',
    method: 'get',
    params
  });

// 退回到进件列表
export const reopenIndex = (params) =>
  request({
    url: 'projectDetail/reopenIndex',
    method: 'get',
    params
  });

// 买断列表
export const buyoutIndex = (params) =>
  request({
    url: 'projectDetail/buyOutIndex',
    method: 'get',
    params
  });

// 买断列表
export const buildProgressIndex = (params) =>
  request({
    url: 'project/down/br',
    method: 'get',
    params
  });
