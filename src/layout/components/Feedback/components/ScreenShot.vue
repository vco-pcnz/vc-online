<template>
  <div @click="handleScreenshot"><slot></slot></div>
  <!--截图组件-->
  <screen-short v-if="screenshotStatus" @destroy-component="destroyComponent" @get-image-data="getImg"></screen-short>
</template>

<script setup>
import { ref } from 'vue';
import { request } from '@/utils/request';
import { cloneDeep } from 'lodash';
const props = defineProps({
  value: {
    type: Array,
    required: false
  },
  list: {
    type: Array,
    required: false
  }
});
const emits = defineEmits(['update:value', 'update:list', 'change', 'update:show']);

const screenshotStatus = ref(false);
const screenshotData = ref('');

// 销毁组件函数
const destroyComponent = (status) => {
  screenshotStatus.value = status;
};

let fileInfo = {};
const base64ToFormData = (base64, filename = 'screenshot.png') => {
  const timestamp = new Date().getTime();
  filename = timestamp + '.png';
  // 1. 移除 Base64 URL 前缀（如果存在）
  const base64Data = base64.split(',')[1] || base64;

  // 2. 将 Base64 转换为二进制 Blob
  const mimeType = base64.match(/^data:(.*?);base64/)?.[1] || 'image/png';
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: mimeType });

  // 3. 创建 FormData 并添加数据
  const formData = new FormData();
  formData.append('file', blob, filename);
  formData.append('biz', 'temp');
  fileInfo = {
    name: filename,
    type: 1,
    uuid: '',
    size: blob.size,
    value: ''
  };
  return formData;
};

const loading = ref(false);

// 获取裁剪区域图片信息
const getImg = async (base64) => {
  loading.value = true;

  try {
    const formData = base64ToFormData(base64);

    const response = await request({
      url: '/upload/uploadImage',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    fileInfo['uuid'] = response;
    fileInfo['value'] = response;
    update();

    return response;
  } catch (error) {
    throw error;
  } finally {
    loading.value = false;
  }
};
const handleScreenshot = () => {
  screenshotStatus.value = true;
  // emits('update:show',true)
};

const update = () => {
  let fileList = cloneDeep(props.list);
  fileList.push(fileInfo);
  const value = fileList.map((item) => {
    return item.uuid;
  });
  emits('update:show', false);
  emits('update:value', value);
  emits('update:list', fileList);
  emits('change', fileInfo);
};
</script>
<style lang="less">
#screenShotPanel {
  z-index: 30000;
  #toolPanel {
    height: auto !important;
  }
  #optionPanel {
    height: auto !important;
  }
}
</style>
