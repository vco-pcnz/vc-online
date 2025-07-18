import axios from 'axios';
import i18n from '@/i18n';
import { message } from 'ant-design-vue/es';
import { getToken, removeToken } from '@/utils/token-util.js';
import { isEmpty } from 'lodash';
import { useUserStore } from '@/store';
import router from '@/router';
import qs from 'qs';
import { acquire, release } from './request-limiter.js';

function createExternalService() {
  // 创建一个外部网络 axios 实例
  const service = axios.create();

  // HTTP request 拦截器
  service.interceptors.request.use(
    async (config) => {
      await acquire(); // 发请求前排队
      return config;
    },
    (error) => Promise.reject(error)
  );

  // HTTP response 拦截器
  service.interceptors.response.use(
    (response) => {
      release(); // 请求完成释放
      return response;
    },
    (error) => {
      release(); // 请求出错也要释放
      Promise.reject(error.response ?? null);
    }
  );
  return service;
}

function createService() {
  // 创建一个 axios 实例
  const service = axios.create();

  // HTTP request 拦截器
  service.interceptors.request.use(
    async (config) => {
      await acquire(); // 加这行
      return config;
    },
    (error) => {
      console.log(error);
      // 失败
      return Promise.reject(error);
    }
  );

  // HTTP response 拦截器
  service.interceptors.response.use(
    (response) => {
      release();

      const disposition = response.headers['content-disposition'] || response.headers['Content-Disposition'] || null;
      if ((disposition || !/^application\/json/.test(response.headers['content-type'])) && response.status === 200) {
        return response;
      } else if (response.data.size) {
        response.data.code = 500;
        response.data.message = i18n.global.t('服务器内部错误');
        response.data.success = false;
      }

      const { code, data, msg, count, otherInfo } = response.data;
      if (code === 0) {
        if (count || count === 0) {
          return Promise.resolve({
            count,
            data,
            otherInfo,
          });
        } else {
          return Promise.resolve(data);
        }
      } else if (code === 401) {
        const userStore = useUserStore();
        userStore.logout();
      } else if (code === 403) {
        router.push('/403');
        return Promise.reject({
          code,
          msg,
        });
      } else {
        if (!response.config.diyError) {
          message.error({
            content: msg,
          });
        }
        return Promise.reject({
          code,
          msg,
        });
      }
    },
    (error) => {
      release();
      const err = (text) => {
        message.error({
          content: error.response && error.response.data && error.response.data.message ? error.response.data.message : text,
        });
      };
      if (error.response && error.response.data) {
        switch (error.response.status) {
          case 404:
            err(i18n.global.t('服务器资源不存在'));
            break;
          case 500:
            err(i18n.global.t('服务器内部错误'));
            break;
          case 401:
            const userStore = useUserStore();
            userStore.logout();
            break;
          case 403:
            err(i18n.global.t('没有权限访问该资源'));
            break;
          default:
            err(i18n.global.t('未知错误！'));
        }
      } else {
        err(i18n.global.t('请求超时，服务器无响应！'));
      }
      return Promise.reject(error.response && error.response.data ? error.response.data : null);
    }
  );
  return service;
}

//节流
function throttle(fn, wait = 1500) {
  return function () {
    let context = this;
    if (!throttle.timer) {
      fn.apply(context, arguments);
      throttle.timer = setTimeout(function () {
        throttle.timer = null;
      }, wait);
    }
  };
}

function stringify(data) {
  return qs.stringify(data, { 
    allowDots: true, 
    encode: true, // 强制编码参数值
    encoder: (value) => encodeURIComponent(value), // 自定义编码逻辑
  });
  // return qs.stringify(data, { allowDots: true, encode: false });
}

/**
 * @description 创建请求方法
 * @param service
 * @param externalService
 */
function createRequest(service, externalService) {
  return function (config) {
    const env = import.meta.env;
    const token = getToken();

    const headerConfig = {
      Lang: i18n.global.locale.value === 'zh-cn' ? 'zh_CN' : i18n.global.locale.value,
    };

    if (token) {
      headerConfig['Authorization'] = token;
      // headerConfig["Authorizations"] = token;
    }
    const configDefault = {
      headers: Object.assign(
        {
          ...headerConfig,
        },
        config.headers
      ),

      timeout: 600000,
      data: {},
    };

    delete config.headers;
    const option = Object.assign(configDefault, config);

    // json
    if (!isEmpty(option.params)) {
      option.url = option.url + '?' + stringify(option.params);
      option.params = {};
    }

    if (!/^(http|https)/g.test(option.url)) {
      option.baseURL = env.VITE_APP_OPEN_PROXY === 'true' ? env.VITE_APP_PROXY_PREFIX : env.VITE_APP_BASE_URL;

      return service(option);
    } else {
      return externalService(option);
    }
  };
}

export const service = createService();
export const externalService = createExternalService();
export const request = createRequest(service, externalService);
