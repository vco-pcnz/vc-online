<template>
  <div>
    <div class="title">{{ title }}</div>
    <div class="flex gap-5">
      <a-upload ref="uploadRef" :action="uploadUrl + '/transfer/importData'" :headers="headers" :beforeUpload="beforeUpload" :data="{ ...params }" name="file" :showUploadList="false" @change="handleChange">
        <a-button type="cyan" :loading="importLoading">Import</a-button>
      </a-upload>
      <a-button type="cyan" :loading="exportLoading" @click="report">template</a-button>
    </div>
  </div>
  <Confirm ref="confirmRef" :data="uploadResult"></Confirm>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import tool from '@/utils/tool';
import Confirm from './confirm.vue';
import { request } from '@/utils/request';
import { getToken } from '@/utils/token-util';

const uploadUrl = ref(import.meta.env.VITE_APP_OPEN_PROXY === 'true' ? import.meta.env.VITE_APP_PROXY_PREFIX : import.meta.env.VITE_APP_BASE_URL);

const { t } = useI18n();

const props = defineProps({
  title: {
    type: String
  },
  exportUrl: {
    type: String
  },
  viewUrl: {
    type: String
  },
  // 后端要求携带的其他参数
  params: {
    type: Object,
    required: false,
    default: () => {
      return {};
    }
  }
});
const uploadResult = ref({});
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
const confirmRef = ref();
// 上传
const importLoading = ref(false);
const handleChange = (info) => {
  let list = info.fileList.filter((item) => !!item.status);
  if (list.filter((item) => item.status == 'uploading').length) {
    importLoading.value = true;
  }
  if (info.file.status === 'done') {
    if (info.file.response.success) {
      uploadResult.value = info.file.response.data;
      confirmRef.value.updateVisible(true);
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
  window.open(props.exportUrl);
  return;
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

const headers = ref({ 'Content-Type': 'multipart/form-data' });
onMounted(() => {
  const token = getToken();
  headers.value = { Authorization: token };
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}
</style>
