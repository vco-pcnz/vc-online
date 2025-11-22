import { request } from '@/utils/request';

// Buy-Out计算BOC放款的Balance
export const buyOutCalculate = (data) =>
  request({
    url: '/project/buyout/buyOutCalculate',
    method: 'post',
    data
  });

// 买断申请保存
export const buyOutSave = (data) =>
  request({
    url: '/project/buyout/save',
    method: 'post',
    data
  });