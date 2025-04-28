const maxConcurrentRequests = 8; // 同时最多5个
let currentRequests = 0;
const pendingQueue = [];

function next() {
  if (pendingQueue.length > 0 && currentRequests < maxConcurrentRequests) {
    const { resolve } = pendingQueue.shift();
    currentRequests++;
    resolve();
  }
}

export function acquire() {
  if (currentRequests < maxConcurrentRequests) {
    currentRequests++;
    return Promise.resolve();
  } else {
    return new Promise((resolve) => {
      pendingQueue.push({ resolve });
    });
  }
}

export function release() {
  currentRequests--;
  next();
}
