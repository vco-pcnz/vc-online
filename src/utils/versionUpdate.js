const UPDATE_CHECK_INTERVAL = 3 * 60 * 1000;

export function setupAppVersionAutoRefresh() {
  const canAutoUpdateApp =
    import.meta.env.VITE_AUTOMATICALLY_DETECT_UPDATE === 'Y' &&
    import.meta.env.PROD;

  if (!canAutoUpdateApp) return;

  let updateInterval;
  let isReloading = false;

  const checkForUpdates = async () => {
    if (isReloading) return;

    const latestBuildTime = await getHtmlBuildTime();

    if (!latestBuildTime || latestBuildTime === BUILD_TIME) {
      return;
    }

    isReloading = true;
    window.location.reload();
  };

  const startUpdateInterval = () => {
    if (updateInterval) {
      window.clearInterval(updateInterval);
    }
    updateInterval = window.setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkForUpdates();
      startUpdateInterval();
    }
  });

  if (document.visibilityState === 'visible') {
    checkForUpdates();
    startUpdateInterval();
  }
}

async function getHtmlBuildTime() {
  const baseUrl = import.meta.env.BASE_URL || '/';

  try {
    const res = await fetch(`${baseUrl}index.html?t=${Date.now()}`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      return null;
    }

    const html = await res.text();
    const match = html.match(/<meta name="buildTime" content="(.*?)"\s*\/?>/i);

    return match?.[1] || null;
  } catch (error) {
    window.console.error('getHtmlBuildTime error:', error);
    return null;
  }
}
