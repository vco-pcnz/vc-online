import { request } from '@/utils/request';

// 变更请求-列表
export const projectVariationList = (params) =>
  request({
    url: 'project/variation/variation',
    method: 'get',
    params
  });

// 变更请求-详情
export const projectVariationInfo = (params) =>
  request({
    url: 'project/variation/info',
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

  // 变更-forecast统计
  export const projectVariationForecastUpd = (params) =>
    request({
      url: 'project/variation/forecastUpd',
      method: 'get',
      params
    });

  // 变更-下载
  export const projectVariationExportExcel = (params) =>
    request({
      url: 'project/variation/exportExcel',
      method: 'get',
      params
    });

  // forecast darwDown列表
  export const projectVariationDarwdownLog = (params) =>
    request({
      url: 'project/variation/darwdownLog',
      method: 'get',
      params
    });

  // forecast 新增、编辑
  export const projectVariationAddf = (data) =>
    request({
      url: 'project/variation/addf',
      method: 'post',
      data
    });

  // forecast 删除
  export const projectVariationDeletef = (data) =>
    request({
      url: 'project/variation/deletef',
      method: 'post',
      data
    });

  // 变更流程
  export const projectVariationStep = (params) =>
    request({
      url: 'project/variation/step',
      method: 'get',
      params
    });

  // 变更流程 - 提交申请
  export const projectVariationSave = (data) =>
    request({
      url: 'project/variation/save',
      method: 'post',
      data
    });