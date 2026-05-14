const SESSION_PASSWORD_LOCK_KEY = 'vc-online-session-password-locked';

export function setSessionPasswordLocked() {
  localStorage.setItem(SESSION_PASSWORD_LOCK_KEY, '1');
}

export function clearSessionPasswordLocked() {
  localStorage.removeItem(SESSION_PASSWORD_LOCK_KEY);
}

export function isSessionPasswordLocked() {
  return localStorage.getItem(SESSION_PASSWORD_LOCK_KEY) === '1';
}
