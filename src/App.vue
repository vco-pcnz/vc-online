<script setup>
  import { ref } from 'vue'
  import dayjs from 'dayjs'
  import tool from '@/utils/tool'

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
  }

  const langData = {
    'en': en_GB,
    'zh-cn': zh_CN,
    'zh-tw': zh_TW
  }

  const lang = ref(tool.local.get('vc-online-language') || 'en')

  dayjs.locale(lang);
</script>

<template>
  <a-config-provider :locale="langData[lang]" :theme="themeConfig">
    <router-view />
  </a-config-provider>
</template>
