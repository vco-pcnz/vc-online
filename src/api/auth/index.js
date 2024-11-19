import { request } from "@/utils/request";

/**
 * 登录
 */
export const login = (data) =>
  request({
    url: "/login",
    method: "post",
    data,
  });

/**
 * 退出登录
 */
export const logout = () =>
  request({
    url: "/logout",
    method: "get"
  });

/**
 * 密码重置
 */
export const resetPwd = (data) =>
  request({
    url: "/resetPwd",
    method: "post",
    data,
  });

/**
 * 注册
 */
export const register = (data) =>
  request({
    url: "/register",
    method: "post",
    data,
  });

// 获取注册条款
export const getRegisterTerm = (params) =>
  request({
    url: "/note",
    method: "get",
    params
  });

// 注册发送邮箱验证码
export const sendAuthCode = (data) =>
  request({
    url: "/getCode",
    method: "post",
    data,
  });

// 注册角色申请
export const roleApply = (data) =>
  request({
    url: "/roleApply",
    method: "post",
    data,
  });
