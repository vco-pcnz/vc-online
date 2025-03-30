<template>
  <div>
    <div class="title">{{ title }}</div>
    <div class="flex gap-5">
      <a-upload ref="uploadRef" :action="uploadUrl + importUrl" :headers="{ 'Content-Type': 'multipart/form-data' }" :beforeUpload="beforeUpload" :data="{ biz: bizPath, ...params }" name="file" :showUploadList="false" @change="handleChange">
        <a-button type="cyan" :loading="importLoading">Import</a-button>
      </a-upload>
      <a-button type="cyan" :loading="exportLoading" @click="report">Export</a-button>
    </div>
  </div>
  <!-- <a v-if="uuid" :href="viewUrl + '?uuid=' + uuid" target="blank">View</a> -->
</template>
<!-- 用户转移
利益相关者转移
项目基础信息转移
抵押物转移
Forecast 转移
Schedule 转移
文件转移
放款数据转移 -->
<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import tool from '@/utils/tool';
import { request } from '@/utils/request';

const uploadUrl = import.meta.env.VITE_APP_OPEN_PROXY === 'true' ? import.meta.env.VITE_APP_PROXY_PREFIX : import.meta.env.VITE_APP_BASE_URL;

const { t } = useI18n();

const props = defineProps({
  title: {
    type: String
  },
  importUrl: {
    type: String
  },
  exportUrl: {
    type: String
  },
  viewUrl: {
    type: String
  }
});
const uuid = ref('');
const fileType = ref(['xls', 'xlsx', 'csv', 'json', 'txt', 'doc', 'docx', 'ppt', 'pptx', 'pdf', 'xmind']);
const beforeUpload = (file, tips) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const isFileType = fileType.value.includes(fileExtension);
  if (!isFileType) {
    if (tips) {
      message.error(errTip.value);
      return false;
    }
  }
  return isFileType;
};

// 上传
const importLoading = ref(false);
const handleChange = (info) => {
  let list = info.fileList.filter((item) => !!item.status);
  if (list.filter((item) => item.status == 'uploading').length) {
    importLoading.value = true;
  }
  if (info.file.status === 'done') {
    if (info.file.response.success) {
    } else {
      message.error(`${info.file.response.msg}` || ` ${t('上传失败')}.`);
    }
    importLoading.value = false;
  } else if (info.file.status === 'error') {
    importLoading.value = false;
    message.error(`${info.file.name} ${t('上传失败')}.`);
  }
};

// 导出模板
const exportLoading = ref(false);
const report = () => {
  exportLoading.value = true;
  const paramsInfo = {
    url: props.exportUrl,
    method: 'get',
    params: {}
  };

  request(paramsInfo)
    .then((res) => {
      window.open(res);
    })
    .finally(() => {
      exportLoading.value = false;
    });
};
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}
</style>
