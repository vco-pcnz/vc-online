/**
 * token 操作封装
 */
const VITE_APP_TOKEN_PREFIX = import.meta.env.VITE_APP_TOKEN_PREFIX;

/**
 * 获取缓存的 token
 */
export function getToken() {
  const token = localStorage.getItem(VITE_APP_TOKEN_PREFIX);
  if (!token) {
    return sessionStorage.getItem(VITE_APP_TOKEN_PREFIX);
  }
  return token;
}

/**
 * 缓存 token
 * @param token token
 * @param remember 是否永久存储
 */
export function setToken(token, remember) {
  removeToken();
  if (token) {
    const tokenValue = `Bearer ${token}`;
    if (remember) {
      localStorage.setItem(VITE_APP_TOKEN_PREFIX, tokenValue);
    } else {
      sessionStorage.setItem(VITE_APP_TOKEN_PREFIX, tokenValue);
    }
  }
}

/**
 * 移除 token
 */
export function removeToken() {
  localStorage.removeItem(VITE_APP_TOKEN_PREFIX);
  sessionStorage.removeItem(VITE_APP_TOKEN_PREFIX);
}
