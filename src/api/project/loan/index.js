import { request } from '@/utils/request';

// 放款请求-列表
export const loanDrawdown = (params) =>
  request({
    url: 'project/loan/drawdown',
    method: 'get',
    params
  });
  // 文件夹-选择
  export const loanEdit = (data) =>
    request({
      url: 'project/loan/edit',
      method: 'post',
      data
    });
  