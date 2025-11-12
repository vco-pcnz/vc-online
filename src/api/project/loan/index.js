import { request } from '@/utils/request';

// 放款请求-列表
export const loanDrawdown = (params) =>
  request({
    url: 'project/loan/drawdown',
    method: 'get',
    params
  });

// 放款申请--新增
export const loanDedit = (data) =>
  request({
    url: 'project/loan/dedit',
    method: 'post',
    data
  });

// 放款数据统计
export const loanDstatistics = (params) =>
  request({
    url: 'project/loan/dstatistics',
    method: 'get',
    params
  });

// 还款数据统计
export const loanRstatistics = (params) =>
  request({
    url: 'project/loan/rstatistics',
    method: 'get',
    params
  });

// 还款申请--新增
export const loanRDedit = (data) =>
  request({
    url: 'project/loan/redit',
    method: 'post',
    data
  });

// 还款申请-列表
export const loanRepayment = (params) =>
  request({
    url: 'project/loan/repayment',
    method: 'get',
    params
  });

// lm修改实际还款金额
export const loanRchange = (data) =>
  request({
    url: 'project/loan/rchange',
    method: 'post',
    data
  });

// 预测放款数据darwdown
export const forecastDarwdown = (params) =>
  request({
    url: 'project/forecast/darwdown',
    method: 'get',
    params
  });

// lm修改实际放款金额
export const loanDchange = (data) =>
  request({
    url: 'project/loan/dchange',
    method: 'post',
    data
  });

// lm选择darwdown
export const loanDsel = (data) =>
  request({
    url: 'project/loan/dsel',
    method: 'post',
    data
  });

// 放款审核同意
export const loanDsaveStep = (data) =>
  request({
    url: 'project/loan/dsaveStep',
    method: 'post',
    data
  });

// 还款审核同意
export const loanRsaveStep = (data) =>
  request({
    url: 'project/loan/rsaveStep',
    method: 'post',
    data
  });

// 放款召回
export const loanDrecall = (data) =>
  request({
    url: 'project/loan/drecall',
    method: 'post',
    data
  });

// 放款撤销
export const loanDrevoke = (data) =>
  request({
    url: 'project/loan/drevoke',
    method: 'post',
    data
  });

// 还款款召回
export const loanRrecall = (data) =>
  request({
    url: 'project/loan/rrecall',
    method: 'post',
    data
  });

// 还款撤销
export const loanRrevoke = (data) =>
  request({
    url: 'project/loan/rrevoke',
    method: 'post',
    data
  });

// 还款申请--删除抵押物
export const loanDelSecurity = (data) =>
  request({
    url: 'project/discharge/delSecurity',
    method: 'post',
    data
  });

// 还款申请--解押抵押物
export const loanDisSecurity = (data) =>
  request({
    url: 'project/discharge/disSecurity',
    method: 'post',
    data
  });

// 放款拒绝
export const loanDdeclinel = (data) =>
  request({
    url: 'project/loan/ddecline',
    method: 'post',
    data
  });

// 还款款拒绝
export const loanRdeclinel = (data) =>
  request({
    url: 'project/loan/rdecline',
    method: 'post',
    data
  });

// 放款退回上一步
export const loanDgoBack = (data) =>
  request({
    url: 'project/loan/dgoBack',
    method: 'post',
    data
  });

// 还款退回上一步
export const loanRgoBack = (data) =>
  request({
    url: 'project/loan/rgoBack',
    method: 'post',
    data
  });

// forecast darwDown列表
export const darwdownLog = (params) =>
  request({
    url: 'project/forecast/darwdownLog',
    method: 'get',
    params
  });

// 删除
export const forecastDelete = (data) =>
  request({
    url: 'project/forecast/deletef',
    method: 'post',
    data
  });

// forecast darwDown列表
export const addf = (data) =>
  request({
    url: 'project/forecast/addf',
    method: 'post',
    data
  });

// forecast darwDown列表
export const dsaveStake = (data) =>
  request({
    url: 'project/loan/dsaveStake',
    method: 'post',
    data
  });

// 解押数据统计
export const dischargeStatistics = (params) =>
  request({
    url: 'project/discharge/statistics',
    method: 'get',
    params
  });

// 解押-列表
export const dischargeSecurity = (params) =>
  request({
    url: 'project/discharge/security',
    method: 'get',
    params
  });

// 抵押物申请编辑-列表
export const dischargeApplySecurityEdit = (params) =>
  request({
    url: 'project/discharge/applySecurityEdit',
    method: 'get',
    params
  });

// 抵押物解押申请-列表
export const dischargeApplyDischarge = (params) =>
  request({
    url: 'project/discharge/applyDischarge',
    method: 'get',
    params
  });

// 抵押物详情
export const dischargeInfo = (params) =>
  request({
    url: 'project/discharge/info',
    method: 'get',
    params
  });

// 抵押物编辑审核详情
export const dischargeEinfo = (params) =>
  request({
    url: 'project/discharge/einfo',
    method: 'get',
    params
  });

// 抵押物解押审核详情
export const dischargeNinfo = (params) =>
  request({
    url: 'project/discharge/ninfo',
    method: 'get',
    params
  });

// 抵押物提交编辑申请
export const dischargeEedit = (data) =>
  request({
    url: 'project/discharge/eedit',
    method: 'post',
    data
  });

// 抵押物新增列表
export const dischargeApplySecurity = (params) =>
  request({
    url: 'project/discharge/applySecurity',
    method: 'get',
    params
  });

// 解押-申请提交
export const dischargeEdit = (data) =>
  request({
    url: 'project/discharge/edit',
    method: 'post',
    data
  });

// 解押-批量申请提交
export const dischargeBatchEdit = (data) =>
  request({
    url: 'project/discharge/nedit',
    method: 'post',
    data
  });

// 解押-同意申请
export const dischargeSaveStep = (data) =>
  request({
    url: 'project/discharge/saveStep',
    method: 'post',
    data
  });

// 抵押物添加-同意申请
export const dischargeSaveDStep = (data) =>
  request({
    url: 'project/discharge/dsaveStep',
    method: 'post',
    data
  });

// 抵押物编辑-同意申请
export const dischargeSaveEStep = (data) =>
  request({
    url: 'project/discharge/esaveStep',
    method: 'post',
    data
  });

// 抵押解押-同意申请
export const dischargeSaveNStep = (data) =>
  request({
    url: 'project/discharge/nsaveStep',
    method: 'post',
    data
  });

// 解押-召回申请
export const dischargeRecall = (data) =>
  request({
    url: 'project/discharge/recall',
    method: 'post',
    data
  });

// 解押-退回
export const dischargeGoback = (data) =>
  request({
    url: 'project/discharge/goBack',
    method: 'post',
    data
  });

// 解押添加-拒绝
export const dischargeDdecline = (data) =>
  request({
    url: 'project/discharge/ddecline',
    method: 'post',
    data
  });

// 解押申请-拒绝
export const dischargeNdecline = (data) =>
  request({
    url: 'project/discharge/ndecline',
    method: 'post',
    data
  });

// 抵押物编辑-拒绝
export const dischargeEdecline = (data) =>
  request({
    url: 'project/discharge/edecline',
    method: 'post',
    data
  });

// 全额还款金额试算
export const projectLoanAllRepayment = (data) =>
  request({
    url: 'project/loan/allRepayment',
    method: 'post',
    data
  });

// 计算irr
export const projectLoanCalcIrr = (data) =>
  request({
    url: 'project/loan/calcIrr',
    method: 'post',
    data
  });

// 获取项目变更财务字段数值
export const projectCreditVariation = (params) =>
  request({
    url: 'project/credit/variation',
    method: 'get',
    params
  });

// 变更提交
export const projectVariationEdit = (data) =>
  request({
    url: 'project/variation/edit',
    method: 'post',
    data
  });

// 变更选择放款
export const projectVariationDrawdownSel = (params) =>
  request({
    url: 'project/variation/drawdownSel',
    method: 'get',
    params
  });

// 还款选择抵押物
export const projectDischargeSelSecurity = (params) =>
  request({
    url: 'project/discharge/selSecurity',
    method: 'get',
    params
  });

// 获取公司信息
export const getCompanyInfo = (params) =>
  request({
    url: 'project/apply/getCompanyInfo',
    method: 'get',
    params
  });

// 获取公司详细
export const getCompanyInfoByNzbn = (params) =>
  request({
    url: 'project/apply/getCompanyInfoByNzbn',
    method: 'get',
    params
  });

// 变更自动计算broker fee
export const borkerFeeCalc = (params) =>
  request({
    url: 'project/variation/borkerFeeCalc',
    method: 'get',
    params
  });

// 对账单-列表
export const getReconciliation = (params) =>
  request({
    url: 'project/loan/getReconciliation',
    method: 'get',
    params
  });

// 删除
export const reconciliation = (data) =>
  request({
    url: 'project/forecast/reconciliation',
    method: 'post',
    data
  });

// 删除
export const drawDownSelected = (params) =>
  request({
    url: '/project/loan/drawDownSelected',
    method: 'get',
    params
  });

  
// 删除
export const drawDownLists = (params) =>
  request({
    url: '/project/loan/drawDownLists',
    method: 'get',
    params
  });
  
// 删除
export const repaymentDetail = (params) =>
  request({
    url: '/project/loan/repaymentDetail',
    method: 'get',
    params
  });