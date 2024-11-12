/**
 * axios 实例
 */
import axios from "axios";
import i18n from "@/i18n";
import { message } from "ant-design-vue/es";
import { API_BASE_URL, TOKEN_HEADER_NAME } from "@/config/setting";
import { getToken } from "./token-util";
// TODO: 
// import { logout } from "./page-tab-util";

const service = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * 添加请求拦截器
 */
service.interceptors.request.use(
  (config) => {
    // 添加 token 到 header
    const token = getToken();
    if (token && config.headers) {
      config.headers[TOKEN_HEADER_NAME] = token;
    }

    // 添加语言标识
    if (!config.params) {
      config.params = {};
      config.params.lang = i18n.global.locale.value;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * 添加响应拦截器
 */
service.interceptors.response.use(
  (res) => {
    const { status, data } = res;
    if (status === 200) {
      const codeNum = Number(data.code);

      if (codeNum === 401) {
        // logout(true);
        return Promise.reject(new Error(data.msg));
      } else if (codeNum === 0) {
        if (data.count || data.count === 0) {
          return Promise.resolve({
            count: data.count,
            list: data.data,
          });
        } else {
          return Promise.resolve(data.data);
        }
      } else {
        message.error(data.msg);
        return Promise.reject(data.msg);
      }
    } else {
      return Promise.reject("error");
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default service;
