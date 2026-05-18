const SESSION_PASSWORD_LOCK_KEY = 'vc-online-session-password-locked';
const SESSION_LAST_ACTIVE_TIME_KEY = 'vc-online-session-last-active-time';

function clearLegacySessionPasswordLockKeys() {
  Object.keys(localStorage).forEach((key) => {
    if (key === SESSION_PASSWORD_LOCK_KEY || key.startsWith(`${SESSION_PASSWORD_LOCK_KEY}:`)) {
      localStorage.removeItem(key);
    }
  });
}

export function recordSessionActivity(time = Date.now()) {
  localStorage.setItem(SESSION_LAST_ACTIVE_TIME_KEY, String(time));
}

export function getSessionLastActiveTime() {
  const lastActiveTime = Number(localStorage.getItem(SESSION_LAST_ACTIVE_TIME_KEY));
  return Number.isFinite(lastActiveTime) ? lastActiveTime : 0;
}

export function getSessionIdleRemainingTime(idleTimeout) {
  const lastActiveTime = getSessionLastActiveTime();
  if (!lastActiveTime) return idleTimeout;

  return Math.max(idleTimeout - (Date.now() - lastActiveTime), 0);
}

export function isSessionIdleTimedOut(idleTimeout) {
  return getSessionIdleRemainingTime(idleTimeout) <= 0;
}

export function clearSessionPasswordLocked() {
  localStorage.removeItem(SESSION_LAST_ACTIVE_TIME_KEY);
  clearLegacySessionPasswordLockKeys();
}
