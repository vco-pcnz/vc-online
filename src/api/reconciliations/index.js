import { request } from '@/utils/request';

export const getReconciliations = () => {
  return;
};

// 对账列表
export const reconciliationList = (params) =>
  request({
    url: 'reconciliation/reconciliationList',
    method: 'get',
    params
  });

// 银行账单列表
export const getStatements = (params) =>
  request({
    url: 'reconciliation/statementList',
    method: 'get',
    params
  });

// vco交易列表
export const getTransactions = (params) =>
  request({
    url: 'reconciliation/transactionList',
    method: 'get',
    params
  });

// 对账
export const checkMatchBill = (data) =>
  request({
    url: 'reconciliation/checkMatchBill',
    method: 'post',
    data
  });

// 取消对账
export const cancelReconciliation = (data) =>
  request({
    url: 'reconciliation/cancelReconciliation',
    method: 'post',
    data
  });

// 更新vco交易记录
export const updateTransaction = (data) =>
  request({
    url: 'reconciliation/updateTransaction',
    method: 'post',
    data
  });

// 移除vco交易记录
export const removeTransactions = (data) =>
  request({
    url: 'reconciliation/removeTransactions',
    method: 'post',
    data
  });

// 新增vco交易记录
export const addTransaction = (data) =>
  request({
    url: 'reconciliation/addTransaction',
    method: 'post',
    data
  });

// 导入账单
export const importBankBill = (data) =>
  request({
    url: 'reconciliation/importBankBill',
    method: 'post',
    data
  });

// 新增vco交易记录
export const syncBankBill = (data) =>
  request({
    url: 'reconciliation/syncBankBill',
    method: 'post',
    data
  });

// 银行账单拆分
export const splitBill = (data) =>
  request({
    url: 'reconciliation/splitBill',
    method: 'post',
    data
  });

// 撤回拆分
export const revokeSplit = (data) =>
  request({
    url: 'reconciliation/revokeSplit',
    method: 'post',
    data
  });

// 撤回对账
export const revokeReconciliation = (data) =>
  request({
    url: 'reconciliation/revokeReconciliation',
    method: 'post',
    data
  });

// 恢复对账
export const recoverReconciliation = (data) =>
  request({
    url: 'reconciliation/recoverReconciliation',
    method: 'post',
    data
  });

// 合并账单
export const mergeBill = (data) =>
  request({
    url: 'reconciliation/mergeBill',
    method: 'post',
    data
  });

// 撤回合并
export const revokeMerge = (data) =>
  request({
    url: 'reconciliation/revokeMerge',
    method: 'post',
    data
  });

// project详情页对账
export const doReconcile = (data) =>
  request({
    url: 'reconciliation/doReconcile',
    method: 'post',
    data
  });

// 结果报告
export const resultReport = (params) =>
  request({
    url: 'reconciliation/resultReport',
    method: 'get',
    params
  });

// 结果报告明细
export const resultReportDetail = (params) =>
  request({
    url: '/reconciliation/resultReportDetail',
    method: 'get',
    params
  });

// 报告明细导出
export const resultReportExport = (params) =>
  request({
    url: '/reconciliation/resultReportExport',
    method: 'get',
    params
  });

// 报告明细导出
export const reportExport = (params) =>
  request({
    url: '/reconciliation/reportExport',
    method: 'get',
    params
  });
