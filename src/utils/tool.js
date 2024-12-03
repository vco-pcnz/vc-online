import Big from 'big.js';
import dayjs from 'dayjs';
import router from '@/router';
import i18n from './../i18n';

const tool = {}

/**
 * LocalStorage
 */
tool.local = {
  set(table, settings) {
    let _set = JSON.stringify(settings)
    return localStorage.setItem(table, _set);
  },
  get(table) {
    let data = localStorage.getItem(table);
    try {
      data = JSON.parse(data)
    } catch (err) {
      return null
    }
    return data;
  },
  remove(table) {
    return localStorage.removeItem(table);
  },
  clear() {
    return localStorage.clear();
  }
}

/**
 * SessionStorage
 */
tool.session = {
  set(table, settings) {
    let _set = JSON.stringify(settings)
    return sessionStorage.setItem(table, _set);
  },
  get(table) {
    let data = sessionStorage.getItem(table);
    try {
      data = JSON.parse(data)
    } catch (err) {
      return null
    }
    return data;
  },
  remove(table) {
    return sessionStorage.removeItem(table);
  },
  clear() {
    return sessionStorage.clear();
  }
}

/**
 * CookieStorage
 */
tool.cookie = {
  set(name, value, config = {}) {
    var cfg = {
      expires: null,
      path: null,
      domain: null,
      secure: false,
      httpOnly: false,
      ...config
    }
    var cookieStr = `${name}=${escape(value)}`
    if (cfg.expires) {
      var exp = new Date()
      exp.setTime(exp.getTime() + parseInt(cfg.expires) * 1000)
      cookieStr += `;expires=${exp.toGMTString()}`
    }
    if (cfg.path) {
      cookieStr += `;path=${cfg.path}`
    }
    if (cfg.domain) {
      cookieStr += `;domain=${cfg.domain}`
    }
    document.cookie = cookieStr
  },
  get(name) {
    var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"))
    if (arr != null) {
      return unescape(arr[2])
    } else {
      return null
    }
  },
  remove(name) {
    var exp = new Date()
    exp.setTime(exp.getTime() - 1)
    document.cookie = `${name}=;expires=${exp.toGMTString()}`
  }
}

/* Fullscreen */
tool.screen = (element) => {
  let isFull = !!(document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
  if (isFull) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  } else {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    }
  }
}

/* 千分符 */
tool.groupSeparator = (num) => {
  num = num + '';
  if (!num.includes('.')) {
    num += '.'
  }
  return num.replace(/(\d)(?=(\d{3})+\.)/g, function ($0, $1) {
    return $1 + ',';
  }).replace(/\.$/, '');
}

tool.formatSize = (size) => {
  if (typeof size === 'undefined' || size === null || isNaN(size)) {
    return '0 B';
  }
  let units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }

  // 保留两位小数
  return `${Number(size.toFixed(2))} ${units[index]}`;
}

tool.download = (res, downName = '') => {
  const aLink = document.createElement('a');
  let fileName = downName
  let blob = res //第三方请求返回blob对象

  //通过后端接口返回
  if (res.headers && res.data) {
    blob = new Blob([res.data], {type: res.headers['content-type'].replace(';charset=utf8', '')})
    if (!downName) {
        const contentDisposition = decodeURI(res.headers['content-disposition'])
        const result = contentDisposition.match(/filename\*=utf-8\'\'(.+)/gi)
        fileName = result[0].replace(/filename\*=utf-8\'\'/gi, '')
    }
  }
  
  aLink.href = URL.createObjectURL(blob)
  // 设置下载文件名称
  aLink.setAttribute('download', fileName)
  document.body.appendChild(aLink)
  aLink.click()
  document.body.removeChild(aLink)
  URL.revokeObjectURL(aLink.href)
}

/**
 * 对象转url参数
 * @param {*} data
 * @param {*} isPrefix
 */
tool.httpBuild = (data, isPrefix = false) => {
  let prefix = isPrefix ? '?' : ''
  let _result = []
  for (let key in data) {
    let value = data[key]
    // 去掉为空的参数
    if (['', undefined, null].includes(value)) {
      continue
    }
    if (value.constructor === Array) {
      value.forEach(_value => {
        _result.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value))
      })
    } else {
      _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value))
    }
  }

  return _result.length ? prefix + _result.join('&') : ''
}

tool.getRequestParams = (url) => {
  const theRequest = new Object()
  if (url.indexOf('?') != -1) {
    const params = url.split('?')[1].split('&')
    for (let i = 0; i < params.length; i++) {
      const param = params[i].split('=')
      theRequest[param[0]] = decodeURIComponent(param[1])
    }
  }
  return theRequest
}

/**
 * 获取token
 */
tool.getToken = () => {
  return tool.local.get(import.meta.env.VITE_APP_TOKEN_PREFIX)
}

/**
 * 转Unix时间戳
 */
tool.toUnixTime = (date) => {
  return Math.floor((new Date(date)).getTime() / 1000)
}

tool.arrSum = (arr) => {
  let sum = 0
  arr.map(item => sum += item)
  return sum
}

/**
 * 获取数据类型
 */
tool.getObjType = (o) => {
  if (o === null) {
    return "null"
  }
  if (typeof o !== "object") {
    return typeof o
  } else {
    return Object.prototype.toString.call(o).slice(8, -1).toLocaleLowerCase()
  }
}

/**
 * 加法运算
 */
tool.plus = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return "NaN"
  }

  const res = Big(Number(num1)).plus(Big(Number(num2)))
  return res.toString()
}

/**
 * 减法运算
 */
tool.minus = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return "NaN"
  }

  const res = Big(Number(num1)).minus(Big(Number(num2)))
  return res.toString()
}

/**
 * 乘法运算
 */
tool.times = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return "NaN"
  }

  const res = Big(Number(num1)).times(Big(Number(num2)))
  return res.toString()
}

/**
 * 除法运算
 */
tool.div = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return "NaN"
  }

  const res = Big(Number(num1)).div(Big(Number(num2)))
  return res.toString()
}

/**
 * 日期格式本地化
 */
tool.showDate = (time) => {
  const locale = i18n.global.locale.value
  const date = dayjs(time, 'YYYY/MM/DD'); // 解析原始日期字符串
  const format = locale === 'en' ? `DD MMM 'YY` : 'YYYY/MM/DD'
  return date.format(format)
}

/**
 * 时间格式
 */
tool.showTime = (time) => {
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

/**
 * 日期天数
 */
tool.diffDate = (a, b) => {
  const date1 = dayjs(a)
  const date2 = dayjs(b)

  return date2.diff(date1, 'day')
}

/**
 * 日期天数-月份数
 */
tool.calculateDurationPrecise = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const months = end.diff(start, 'month');
  const remainingDays = end.diff(start.add(months, 'month'), 'day');

  let res = {
    months,
    days: remainingDays
  }

  return res
}

/**
 * 日期天数-倒推得到结束时间
 */
tool.calculateEndDate = (startDate, months = 0, days = 0) => {
  const start = dayjs(startDate);
  // 增加月数和天数
  const end = start.add(months, 'month').add(days, 'day');
  return end.format('YYYY-MM-DD'); // 返回格式化的日期
}

/**
 * 判断一个对象里面的所有值都不存在
 */
tool.isAllValuesEmpty = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return false; // 不是对象或是 null，直接返回 false
  }

  return Object.values(obj).every(value => {
    if (value === null || value === undefined || value === '') {
      return true; // 空值
    } else if (Array.isArray(value)) {
      return value.length === 0; // 空数组
    } else if (typeof value === 'object') {
      return Object.keys(value).length === 0; // 空对象
    }
    return false; // 非空值
  });
}

/**
 * 过滤对象里面的空数据
 */
tool.filterEmptyValues = (obj) => {
  // 判断是否为对象或数组
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      // 处理数组：过滤掉空数据并递归处理数组元素
      return obj.map(tool.filterEmptyValues).filter(item => item !== null && item !== undefined && item !== '');
    } else {
      // 处理对象：过滤掉空数据并递归处理值
      return Object.entries(obj).reduce((acc, [key, value]) => {
        const filteredValue = tool.filterEmptyValues(value); // 递归处理值
        if (filteredValue !== null && filteredValue !== undefined && filteredValue !== '') {
          acc[key] = filteredValue;
        }
        return acc;
      }, {});
    }
  }
  // 如果是基础类型，直接返回
  return obj;
}

export const navigationTo = (path) => {
  router.push(path)
}

export const goBack = () => {
  router.back()
}

export default tool
