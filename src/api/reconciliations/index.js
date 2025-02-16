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
    method: 'post'
  });

  // 新增vco交易记录
  export const splitBill = (data) =>
    request({
      url: 'reconciliation/splitBill',
      method: 'post',
      data
    });