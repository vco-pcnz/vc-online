/**
 * Console控制工具
 * 在非本地环境关闭console输出，减少生产环境的调试信息
 */

// 判断是否为本地开发环境
const isDevelopment = () => {
  // 检查当前环境是否为开发环境
  const env = import.meta.env.VITE_APP_ENV || import.meta.env.MODE;
  
  // 本地开发环境的判断条件
  return env === 'development' || 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1'
};

// 保存原始的console方法
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug,
  table: console.table,
  group: console.group,
  groupCollapsed: console.groupCollapsed,
  groupEnd: console.groupEnd,
  time: console.time,
  timeEnd: console.timeEnd,
  trace: console.trace,
  assert: console.assert
};

/**
 * 禁用console输出（保留error，用于重要错误信息）
 */
const disableConsole = () => {
  console.log = () => {};
  console.warn = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.table = () => {};
  console.group = () => {};
  console.groupCollapsed = () => {};
  console.groupEnd = () => {};
  console.time = () => {};
  console.timeEnd = () => {};
  console.trace = () => {};
  // console.assert = () => {}; // 保留assert用于调试
  // 保留console.error用于重要错误信息
};

/**
 * 恢复console输出
 */
const enableConsole = () => {
  Object.keys(originalConsole).forEach(key => {
    console[key] = originalConsole[key];
  });
};

/**
 * 初始化console控制
 */
export const initConsoleControl = () => {
  if (isDevelopment()) {
    // 开发环境：保持所有console输出
    enableConsole();
    console.log('%c[Console] 开发环境 - 已启用所有console输出', 'color: #00ff00; font-weight: bold;');
  } else {
    // 生产/测试环境：禁用大部分console输出
    disableConsole();
    // 使用原始的console.error来显示这条信息
    originalConsole.error('%c[Console] 生产环境 - 已禁用console调试输出（保留error）', 'color: #ff9900; font-weight: bold;');
  }
};

/**
 * 安全的console方法，会根据环境自动控制输出
 */
export const safeConsole = {
  log: (...args) => isDevelopment() && originalConsole.log(...args),
  warn: (...args) => isDevelopment() && originalConsole.warn(...args),
  info: (...args) => isDevelopment() && originalConsole.info(...args),
  debug: (...args) => isDevelopment() && originalConsole.debug(...args),
  error: (...args) => originalConsole.error(...args), // error始终保留
  table: (...args) => isDevelopment() && originalConsole.table(...args),
  group: (...args) => isDevelopment() && originalConsole.group(...args),
  groupCollapsed: (...args) => isDevelopment() && originalConsole.groupCollapsed(...args),
  groupEnd: (...args) => isDevelopment() && originalConsole.groupEnd(...args),
  time: (...args) => isDevelopment() && originalConsole.time(...args),
  timeEnd: (...args) => isDevelopment() && originalConsole.timeEnd(...args),
  trace: (...args) => isDevelopment() && originalConsole.trace(...args)
};

// 导出环境判断函数
export { isDevelopment };

export default {
  initConsoleControl,
  safeConsole,
  isDevelopment,
  enableConsole,
  disableConsole
};
