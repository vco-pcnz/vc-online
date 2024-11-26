import { request } from "@/utils/request";
// 用户列表
export const getUserList = (params) =>
  request({
    url: "user/index",
    method: "get",
    params,
  });

// 添加用户
export const addUser = (data) =>
  request({
    url: "user/add",
    method: "post",
    data,
  });

// 编辑用户
export const editUser = (data) =>
  request({
    url: "user/edit",
    method: "post",
    data,
  });

// 用户角色-选择
export const getRoles = (params) =>
  request({
    url: "role/sel",
    method: "get",
    params,
  });

export const assignRole = (data) =>
  request({
    url: "user/setRoles",
    method: "post",
    data,
  });

// 获取用户信息
export const getUserCenter = () =>
  request({
    url: "user/center",
    method: "get",
  });

// 获取当前未认证邮箱验证码
export const sendUnauthECode = (data) =>
  request({
    url: "user/center/getCodeNowE",
    method: "post",
    data,
  });

// 获取老邮箱验证码
export const sendCodeOldE = (params) =>
  request({
    url: "user/center/getCodeE",
    method: "get",
    params,
  });

// 获取新邮箱验证码
export const sendCodeNewE = (data) =>
  request({
    url: "user/center/getCodeNewE",
    method: "post",
    data,
  });

// 用户邮箱变更提交
export const changeEmail = (data) =>
  request({
    url: "user/center/change",
    method: "post",
    data,
  });

// 获取老手机验证码
export const sendCodeOldM = (params) =>
  request({
    url: "user/center/getCodeM",
    method: "get",
    params,
  });

// 获取新手机验证码
export const sendCodeNewM = (data) =>
  request({
    url: "user/center/getCodeNewM",
    method: "post",
    data,
  });

// 获取当前未认证手机号验证码
export const sendUnauthCodeM = (data) =>
  request({
    url: "user/center/getCodeNowM",
    method: "post",
    data,
  });

// 用户手机变更提交
export const changeMobile = (data) =>
  request({
    url: "user/center/change",
    method: "post",
    data,
  });

// 用户信息编辑
export const modifyUserInfo = (data) =>
  request({
    url: "user/center/modify",
    method: "post",
    data,
  });

// 用户安全密码变更提交
export const modifyUserPwd = (data) =>
  request({
    url: "user/center/upw",
    method: "post",
    data,
  });
