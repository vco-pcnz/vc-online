import Big from 'big.js';
import dayjs from 'dayjs';
import router from '@/router';
import i18n from './../i18n';

const tool = {};

/**
 * LocalStorage
 */
tool.local = {
  set(table, settings) {
    let _set = JSON.stringify(settings);
    return localStorage.setItem(table, _set);
  },
  get(table) {
    let data = localStorage.getItem(table);
    try {
      data = JSON.parse(data);
    } catch (err) {
      return null;
    }
    return data;
  },
  remove(table) {
    return localStorage.removeItem(table);
  },
  clear() {
    return localStorage.clear();
  }
};

/**
 * SessionStorage
 */
tool.session = {
  set(table, settings) {
    let _set = JSON.stringify(settings);
    return sessionStorage.setItem(table, _set);
  },
  get(table) {
    let data = sessionStorage.getItem(table);
    try {
      data = JSON.parse(data);
    } catch (err) {
      return null;
    }
    return data;
  },
  remove(table) {
    return sessionStorage.removeItem(table);
  },
  clear() {
    return sessionStorage.clear();
  }
};

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
    };
    var cookieStr = `${name}=${escape(value)}`;
    if (cfg.expires) {
      var exp = new Date();
      exp.setTime(exp.getTime() + parseInt(cfg.expires) * 1000);
      cookieStr += `;expires=${exp.toGMTString()}`;
    }
    if (cfg.path) {
      cookieStr += `;path=${cfg.path}`;
    }
    if (cfg.domain) {
      cookieStr += `;domain=${cfg.domain}`;
    }
    document.cookie = cookieStr;
  },
  get(name) {
    var arr = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'));
    if (arr != null) {
      return unescape(arr[2]);
    } else {
      return null;
    }
  },
  remove(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() - 1);
    document.cookie = `${name}=;expires=${exp.toGMTString()}`;
  }
};

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
};

/* 千分符 */
tool.groupSeparator = (num) => {
  num = num + '';
  if (!num.includes('.')) {
    num += '.';
  }
  return num
    .replace(/(\d)(?=(\d{3})+\.)/g, function ($0, $1) {
      return $1 + ',';
    })
    .replace(/\.$/, '');
};

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
};

tool.download = (res, downName = '') => {
  const aLink = document.createElement('a');
  let fileName = downName;
  let blob = res; //第三方请求返回blob对象

  //通过后端接口返回
  if (res.headers && res.data) {
    blob = new Blob([res.data], { type: res.headers['content-type'].replace(';charset=utf8', '') });
    if (!downName) {
      const contentDisposition = decodeURI(res.headers['content-disposition']);
      const result = contentDisposition.match(/filename\*=utf-8\'\'(.+)/gi);
      fileName = result[0].replace(/filename\*=utf-8\'\'/gi, '');
    }
  }

  aLink.href = URL.createObjectURL(blob);
  // 设置下载文件名称
  aLink.setAttribute('download', fileName);
  document.body.appendChild(aLink);
  aLink.click();
  document.body.removeChild(aLink);
  URL.revokeObjectURL(aLink.href);
};

/**
 * 对象转url参数
 * @param {*} data
 * @param {*} isPrefix
 */
tool.httpBuild = (data, isPrefix = false) => {
  let prefix = isPrefix ? '?' : '';
  let _result = [];
  for (let key in data) {
    let value = data[key];
    // 去掉为空的参数
    if (['', undefined, null].includes(value)) {
      continue;
    }
    if (value.constructor === Array) {
      value.forEach((_value) => {
        _result.push(encodeURIComponent(key) + '[]=' + encodeURIComponent(_value));
      });
    } else {
      _result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
  }

  return _result.length ? prefix + _result.join('&') : '';
};

tool.getRequestParams = (url) => {
  const theRequest = new Object();
  if (url.indexOf('?') != -1) {
    const params = url.split('?')[1].split('&');
    for (let i = 0; i < params.length; i++) {
      const param = params[i].split('=');
      theRequest[param[0]] = decodeURIComponent(param[1]);
    }
  }
  return theRequest;
};

/**
 * 获取token
 */
tool.getToken = () => {
  return tool.local.get(import.meta.env.VITE_APP_TOKEN_PREFIX);
};

/**
 * 转Unix时间戳
 */
tool.toUnixTime = (date) => {
  return Math.floor(new Date(date).getTime() / 1000);
};

tool.arrSum = (arr) => {
  let sum = 0;
  arr.map((item) => (sum += item));
  return sum;
};

/**
 * 获取数据类型
 */
tool.getObjType = (o) => {
  if (o === null) {
    return 'null';
  }
  if (typeof o !== 'object') {
    return typeof o;
  } else {
    return Object.prototype.toString.call(o).slice(8, -1).toLocaleLowerCase();
  }
};

/**
 * 加法运算
 */
tool.plus = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return 'NaN';
  }

  const res = Big(Number(num1)).plus(Big(Number(num2)));
  return res.toString();
};

/**
 * 减法运算
 */
tool.minus = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return 'NaN';
  }

  const res = Big(Number(num1)).minus(Big(Number(num2)));
  return res.toString();
};

/**
 * 乘法运算
 */
tool.times = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return 'NaN';
  }

  const res = Big(Number(num1)).times(Big(Number(num2)));
  return res.toString();
};

/**
 * 除法运算
 */
tool.div = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return 'NaN';
  }

  const res = Big(Number(num1)).div(Big(Number(num2)));
  return res.toString();
};

/**
 * 判断第一个数是否大于等于第二个数
 */
tool.gte = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) {
    return false;
  }
  return Big(Number(num1)).gte(Big(Number(num2)));
};

/**
 * 日期格式本地化
 */
tool.showDate = (time, myformat) => {
  const locale = i18n.global.locale.value;
  const date = dayjs(time, 'YYYY/MM/DD'); // 解析原始日期字符串
  const format = locale === 'en' ? `DD MMM 'YY` : 'YYYY/MM/DD';
  return date.format(myformat || format);
};

/**
 * 时间格式
 */
tool.showTime = (time, myformat) => {
  const locale = i18n.global.locale.value;
  const date = dayjs(time, 'YYYY/MM/DD HH:mm:ss'); // 解析原始日期字符串
  const format = locale === 'en' ? `DD MMM 'YY HH:mm:ss` : 'YYYY/MM/DD HH:mm:ss';
  return date.format(myformat || format);
  // return dayjs(time).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 日期天数
 */
tool.diffDate = (a, b) => {
  const date1 = dayjs(a);
  const date2 = dayjs(b);

  // return date2.diff(date1, 'day') + 1;
  return date2.diff(date1, 'day');
};

/**
 * 日期天数-月份数
 */
tool.calculateDurationPrecise = (startDate, endDate) => {
  const start = dayjs(startDate);
  const end = dayjs(endDate);

  const months = end.diff(start, 'month');
  // 计算剩余天数时，先获取开始日期的下一个月对应日期
  const nextMonthDate = start.add(months, 'month');
  const remainingDays = end.diff(nextMonthDate, 'day');
  const gapDay = end.diff(start, 'day');

  let res = {
    months,
    days: remainingDays,
    gapDay: gapDay
  };

  return res;
};

/**
 * 日期天数-倒推得到结束时间（根据月份和天数）
 */
tool.calculateEndDate = (startDate, months = 0, days = 0) => {
  const start = dayjs(startDate);
  // 增加月数和天数
  // const end = start.add(months, 'month').add(days, 'day').subtract(1, 'day');
  const end = start.add(months, 'month').add(days, 'day');
  return end.format('YYYY-MM-DD'); // 返回格式化的日期
};

/**
 * 日期天数-倒推得到结束时间（根据总天数）
 */
tool.calculateEndDateByDays = (startDate, days = 0) => {
  const start = dayjs(startDate);
  // 增加月数和天数
  // const end = start.add(days, 'day').subtract(1, 'day');
  const end = start.add(days, 'day');
  return end.format('YYYY-MM-DD'); // 返回格式化的日期
};

/**
 * 判断一个对象里面的所有值都不存在
 */
tool.isAllValuesEmpty = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return false; // 不是对象或是 null，直接返回 false
  }

  return Object.values(obj).every((value) => {
    if (value === null || value === undefined || value === '') {
      return true; // 空值
    } else if (Array.isArray(value)) {
      return value.length === 0; // 空数组
    } else if (typeof value === 'object') {
      return Object.keys(value).length === 0; // 空对象
    }
    return false; // 非空值
  });
};

/**
 * 过滤对象里面的空数据
 */
tool.filterEmptyValues = (obj) => {
  // 判断是否为对象或数组
  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      // 处理数组：过滤掉空数据并递归处理数组元素
      return obj.map(tool.filterEmptyValues).filter((item) => item !== null && item !== undefined && item !== '');
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
};

// 保留小数点后n位 ，默认2
tool.fixNumber = (value, fractionDigits = 2) => +value.toFixed(fractionDigits);

const initialMoneyFormatOptions = {
  prefix: true,
  parentheses: false,
  cents: true
};

// 格式化金额 - 美元
tool.formatMoney = (value, formatOptions) => {
  const options = formatOptions ? { ...initialMoneyFormatOptions, ...formatOptions } : initialMoneyFormatOptions;
  const centsCount = options.cents ? 2 : 0;
  const money = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: centsCount
  }).format(tool.fixNumber(Math.abs(value), centsCount));
  const isNegative = value < 0;
  return `${isNegative ? '-' : ''}${options.prefix ? '$' : ''}${options.parentheses ? `(${money})` : money}`;
};

/**
 * 日期格式本地化
 */
tool.monthYear = (time) => {
  if (!time) return '';
  const [year, month] = time.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  const formattedMonthName = monthNames[monthIndex];
  const formattedYear = year.slice(-2);
  return `${formattedMonthName} '${formattedYear}`;
};

/**
 * 日期格式本地化
 */
tool.monthYearFull = (time) => {
  if (!time) return '';
  const [year, month] = time.split('-');
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthIndex = parseInt(month, 10) - 1;
  const formattedMonthName = monthNames[monthIndex];
  return `${formattedMonthName} ${year}`;
};

/**
 * 日期格式本地化
 */
tool.monthYearDay = (time) => {
  if (!time) return '';
  const [year, month, day] = time.split('-');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIndex = parseInt(month, 10) - 1;
  const formattedMonthName = monthNames[monthIndex];
  const formattedYear = year.slice(-2);
  return `${day} ${formattedMonthName} '${formattedYear}`;
};

export const navigationTo = (path, blank = false) => {
  if (blank) {
    window.open(path, '_blank');
  } else {
    router.push(path);
  }
};

export const goBack = () => {
  router.back();
};

// 数字格式化
export const numberStrFormat = (number, decimal = 2, flag = false) => {
  let resStr = decimal === 0 ? 0 : '0.00';
  const amount = Number(number);

  if (!isNaN(amount)) {
    const options = {
      minimumFractionDigits: decimal
    };
    resStr = flag ? String(Math.abs(amount)) : Math.abs(amount).toLocaleString('en-US', options);
    if (resStr.indexOf('.') > -1) {
      const arr = resStr.split('.');
      if (arr[1].length === 1) {
        resStr = resStr + '0';
      }
      if (arr[1].length > 2 && decimal === 2) {
        resStr = arr[0] + '.' + arr[1].slice(0, 2);
      }
    } else {
      resStr = decimal === 0 ? resStr : resStr + '.00';
    }
  }
  return !isNaN(amount) && amount < 0 ? '-' + resStr : resStr;
};

// 格式化金额还原为数字
export const formatMoneyToNumber = (value) => {
  const num = value.replace(/\$\s?|(,*)/g, '');
  return Number(num);
};

// 对象数组去重
export const removeDuplicates = (arr, key) => {
  return arr.reduce((acc, item) => {
    if (!acc.some((i) => i[key] === item[key])) {
      acc.push(item);
    }
    return acc;
  }, []);
};

// 保留小数点后n位 ，默认2
export const fixNumber = (value, fractionDigits = 2) => {
  if (typeof value === 'number') {
    // 先转换为字符串，如果有小数则字符串截取，没有小数则返回原值
    const str = value.toString();
    const index = str.indexOf('.');
    if (index !== -1) {
      return Number(str.slice(0, index + fractionDigits + 1));
    }
    return str;
  }
  return value;
};

/**
 * 日期选择格式化
 */
export const selectDateFormat = (picker) => {
  const locale = i18n.global.locale.value;
  if (picker == 'month') {
    return locale === 'en' ? `MM/YYYY` : 'YYYY-MM';
  } else {
    return locale === 'en' ? `DD/MM/YYYY` : 'YYYY-MM-DD';
  }
};

/**
 * 文件有效期 默认值
 */
export const expireTimeDefault = (len, arr) => {
  const now = dayjs();
  const oneYearLater = now.add(1, 'year');
  const expire_time_default = oneYearLater.format('YYYY-MM-DD');
  arr = arr || [];
  for (let index = 0; index < len; index++) {
    arr[index] = arr[index] || expire_time_default;
  }
  return arr;
};

// 判断两个数组是否相同
function normalize(val) {
  if (typeof val === 'string' && !isNaN(val)) {
    return Number(val);
  }
  return val;
}

function deepEqual(a, b, path = '') {
  a = normalize(a);
  b = normalize(b);

  if (a === b) return true;
  if (typeof a !== typeof b) {
    console.warn('[类型不同]', path, a, '!==', b);
    return false;
  }

  if (typeof a !== 'object' || a === null || b === null) {
    if (a !== b) {
      console.warn('[值不同]', path, a, '!==', b);
      return false;
    }
    return true;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      console.warn('[数组不同]', path + ' 长度不一致');
      return false;
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i], path + `[${i}]`)) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    console.warn('[字段数量不同]', path, keysA, 'vs', keysB);
    return false;
  }

  for (const key of keysA) {
    if (!(key in b)) {
      console.warn('[缺少字段]', path + '.' + key + ' 在 b 中不存在');
      return false;
    }
    if (!deepEqual(a[key], b[key], path + '.' + key)) return false;
  }

  return true;
}

export const isArrayEqual = (arr1, arr2) => {
  if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
  if (arr1.length !== arr2.length) {
    console.warn('数组长度不同:', arr1.length, arr2.length);
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    const equal = deepEqual(arr1[i], arr2[i], `root[${i}]`);
    if (!equal) return false;
  }

  return true;
};

// 通过dayjs获取季度开始时间和结束日期，默认为本季度， 可以传参数获取具体季度的开始、结束日期
tool.getQuarterRange = (year, quarter) => {
  // 如果没有传参数，使用当前时间
  const now = dayjs();
  const targetYear = year || now.year();
  const targetQuarter = quarter || Math.ceil((now.month() + 1) / 3);

  // 确保quarter在1-4的范围内
  const validQuarter = Math.max(1, Math.min(4, targetQuarter));
  
  // 计算季度开始月份（1季度=1月，2季度=4月，3季度=7月，4季度=10月）
  const startMonth = (validQuarter - 1) * 3 + 1;
  
  // 季度开始日期（每季度第一天）
  const startDate = dayjs().year(targetYear).month(startMonth - 1).date(1).startOf('day');
  
  // 季度结束日期（下季度第一天的前一天）
  const endDate = startDate.add(3, 'month').subtract(1, 'day').endOf('day');
  
  return {
    start: startDate.format('YYYY-MM-DD'),
    end: endDate.format('YYYY-MM-DD'),
    startTime: startDate.format('YYYY-MM-DD HH:mm:ss'),
    endTime: endDate.format('YYYY-MM-DD HH:mm:ss'),
    quarter: validQuarter,
    year: targetYear,
    // 季度名称
    quarterName: `Q${validQuarter} ${targetYear}`,
    // 月份范围
    months: [startMonth, startMonth + 1, startMonth + 2],
    // 当前日期
    currentDate: now.format('YYYY-MM-DD')
  };
};

// 获取上一季度
tool.getLastQuarter = () => {
  const now = dayjs();
  const currentQuarter = Math.ceil((now.month() + 1) / 3);
  
  if (currentQuarter === 1) {
    // 如果当前是第1季度，上一季度是去年第4季度
    return tool.getQuarterRange(now.year() - 1, 4);
  } else {
    // 否则是当年的上一季度
    return tool.getQuarterRange(now.year(), currentQuarter - 1);
  }
};

// 获取下一季度
tool.getNextQuarter = () => {
  const now = dayjs();
  const currentQuarter = Math.ceil((now.month() + 1) / 3);
  
  if (currentQuarter === 4) {
    // 如果当前是第4季度，下一季度是明年第1季度
    return tool.getQuarterRange(now.year() + 1, 1);
  } else {
    // 否则是当年的下一季度
    return tool.getQuarterRange(now.year(), currentQuarter + 1);
  }
};

// 获取本月开始日期到月末日期
tool.getMonthRange = () => {
  const now = dayjs();
  const start = now.startOf('month');
  const end = now.endOf('month'); // 结束日期为月末
  return { 
    start: start.format('YYYY-MM-DD'),
    end: end.format('YYYY-MM-DD'),
    currentDate: now.format('YYYY-MM-DD') // 当前日期
  };
};

export default tool;
