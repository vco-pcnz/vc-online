<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';
import tool from '@/utils/tool';

import zh_CN from 'ant-design-vue/es/locale/zh_CN';
import zh_TW from 'ant-design-vue/es/locale/zh_TW';
import en_GB from 'ant-design-vue/es/locale/en_GB';

import 'dayjs/locale/en';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/zh-tw';

const themeConfig = {
  token: {
    // colorPrimary: '#282828'
    colorPrimary: '#F19915'
  }
};

const langData = {
  en: en_GB,
  'zh-cn': zh_CN,
  'zh-tw': zh_TW
};

const lang = ref(tool.local.get('vc-online-language') || 'en');

dayjs.locale(lang);

// 版本号变化刷新

// 从环境变量或导入的包中获取当前构建版本（需在构建脚本中注入）

const updateAvailable = ref(false);
let versionCheckInterval;

// 检查版本
const checkVersion = async () => {
  try {
    // 添加时间戳防止缓存
    const response = await fetch(`/version.json?t=${Date.now()}`);
    if (!response.ok) throw new Error('Failed to fetch version');
    const data = await response.json();

    const savedVersion = localStorage.getItem('app-version');

    // 如果本地存储的版本不存在或与当前版本不一致，且服务器版本更新
    if (!savedVersion || savedVersion !== data.version_code) {
      if (savedVersion && savedVersion !== data.version_code) {
        // 版本更新了
        updateAvailable.value = true;
        refreshApp();
      }
      // 更新本地存储的版本
      localStorage.setItem('app-version', data.version_code);
    }
  } catch (error) {
    console.error('检查版本更新失败:', error);
  }
};

// 刷新应用
const refreshApp = (code) => {
  localStorage.setItem('app-version', code);
  window.location.reload();
};

// 稍后提醒
const remindLater = () => {
  updateAvailable.value = false;
  // 可以设置一个时间，比如1小时后再检查
  setTimeout(() => {
    checkVersion();
  }, 60 * 60 * 1000);
};

onMounted(() => {
  // 立即检查一次
  checkVersion();
  // 然后每隔5分钟检查一次
  versionCheckInterval = window.setInterval(checkVersion, 5 * 60 * 1000);
});

onUnmounted(() => {
  if (versionCheckInterval) {
    clearInterval(versionCheckInterval);
  }
});
</script>

<template>
  <a-config-provider :locale="langData[lang]" :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>
