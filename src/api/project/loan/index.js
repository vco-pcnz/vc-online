import { request } from '@/utils/request';

// 放款请求-列表
export const loanDrawdown = (params) =>
  request({
    url: 'project/loan/drawdown',
    method: 'get',
    params
  });
  // 文件夹-选择
  export const loanDedit = (data) =>
    request({
      url: 'project/loan/dedit',
      method: 'post',
      data
    });
  