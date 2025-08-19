<template>
  <div>
    <a-upload ref="uploadRef"  :showUploadList="false" :action="uploadAction" :disabled="disabled" :headers="headers" :beforeUpload="beforeUpload" :data="{ biz: bizPath, ...params }" :name="fileName" :multiple="isMultiple" :accept="accept" @change="handleChange">
      <!-- directory 文件夹 -->
      <slot>
        <a-button type="cyan" shape="round">{{ t('导入') }}</a-button>
      </slot>
    </a-upload>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue/es';
import { useI18n } from 'vue-i18n';
import { getToken } from '@/utils/token-util';
import { cloneDeep } from 'lodash';

const uploadUrl = import.meta.env.VITE_APP_OPEN_PROXY === 'true' ? import.meta.env.VITE_APP_PROXY_PREFIX : import.meta.env.VITE_APP_BASE_URL;

const { t } = useI18n();

const emits = defineEmits(['update:value', 'change', 'update:list', 'update:loading']);

const props = defineProps({
  type: {
    type: String,
    required: false,
    default: 'all'
  },
  accept: {
    type: String,
    required: false,
    default: '.xlsx, .xls'
  },
  // 后端要求携带的其他参数
  bizPath: {
    type: String,
    required: false,
    default: 'temp'
  },
  // 后端要求携带的其他参数
  params: {
    type: Object,
    required: false,
    default: () => {
      return {};
    }
  },
  // 是否多图
  isMultiple: {
    type: Boolean,
    required: false,
    default: false
  },
  // 只能查看不可上传和删除时开启该属性
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  maxSize: {
    type: Number,
    required: false,
    default: 100 // 100 MB
  },
  controller: {
    type: String,
    default: '/upload'
  }
});

const uploadAction = ref('');
const headers = ref({ 'Content-Type': 'multipart/form-data' });
const fileName = ref('file');

// 上传文件类型
watch(
  () => props.type,
  (val) => {
    uploadAction.value = uploadUrl + props.controller;
  },
  {
    immediate: true
  }
);

const getType = (filename) => {
  const extension = filename.split('.').pop().toLowerCase();
  if (imageExtensions.includes(extension)) {
    return 1;
  }
  if (fileExtensions.includes(extension)) {
    return 2;
  }
  if (videoExtensions.includes(extension)) {
    return 3;
  }
};

const fileList = ref([]);

const picUrl = ref(false);
const spinning = ref(false);

const getFileAccessHttpUrl = (avatar, subStr = '') => {
  if (!subStr) subStr = 'http';
  if (avatar && avatar.startsWith(subStr)) {
    return avatar;
  } else {
    if (avatar && avatar.length > 0 && avatar.indexOf('[') == -1) {
      return uploadUrl + '/uploads/' + avatar;
    }
  }
};


const beforeUpload = (file, tips) => {
  const isLt2M = file.size / 1024 / 1024 < props.maxSize;
  if (!isLt2M) {
    if (tips) {
      message.error(t('大小不能超过{0}', [`${props.maxSize}MB`]));
      return false;
    }
  }
  return isLt2M;
};

// 回传父组件
const handlePathChange = () => {
  const uploadFiles = cloneDeep(fileList.value);
  let item = [];
  let list = [];
  if (!props.isMultiple) {
    item = uploadFiles[uploadFiles.length - 1].response.data;
  } else {
    for (var i = 0; i < uploadFiles.length; i++) {
      const itemData = uploadFiles[i].response.status === 'history' ? uploadFiles[i].uid : uploadFiles[i].response.data;
      const listItem =
        uploadFiles[i].response.status === 'history'
          ? {
              name: uploadFiles[i].name,
              type: uploadFiles[i].fileType || getType(uploadFiles[i].url),
              uuid: uploadFiles[i].uid,
              size: uploadFiles[i].size,
              value: uploadFiles[i].url
            }
          : {
              name: uploadFiles[i].name,
              type: uploadFiles[i].fileType || getType(uploadFiles[i].url),
              uuid: uploadFiles[i].url,
              size: uploadFiles[i].size,
              value: uploadFiles[i].url
            };
      item.push(itemData);
      list.push(listItem);
    }
  }
  emits('update:value', item);
  emits('update:list', list);
  emits('change', item);
  updateUploading(false);
};

const updateUploading = (val) => {
  spinning.value = val;
  emits('update:loading', val);
};

// 上传
const handleChange = (info) => {
  picUrl.value = false;
  let list = info.fileList.filter((item) => !!item.status);
  if (list.filter((item) => item.status == 'uploading').length) {
    updateUploading(true);
  }
  if (info.file.status === 'done') {
    if (info.file.response.success) {
      picUrl.value = true;
      list = list.map((file) => {
        if (file.response) {
          file.url = getFileAccessHttpUrl(file.response.data);
          file.fileType = file.fileType || getType(file.url);
        }
        return file;
      });
    } else {
      list = list.filter((item) => item.uid !== info.file.uid);
      message.error(`${info.file.response.msg}` || ` ${t('上传失败')}.`);
    }
  } else if (info.file.status === 'error') {
    list = list.filter((item) => item.uid !== info.file.uid);
    message.error(`${info.file.name} ${t('上传失败')}.`);
  }

  fileList.value = list;
  if (info.file.status === 'done') {
    if (list.length === 1) {
      handlePathChange();
    } else {
      const num = list.filter((item) => item.status !== 'uploading').length;
      if (num === list.length) {
        handlePathChange();
      }
    }
  }
  if (info.file.status === 'removed') {
    handlePathChange();
  }

  if (info.file && info.fileList.length) {
    const index = info.fileList.findIndex((item) => item.uid === info.file.uid);

    if (index > -1) {
      if (!beforeUpload(info.file, false)) {
        fileList.value?.splice(index, 1);
      }
    }
  }
};

onMounted(() => {
  const token = getToken();
  headers.value = { Authorization: token };
});

</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.images-uploader {
  :deep(.ant-upload) {
    width: 110px !important;
    height: 110px !important;
    background-color: #f7f9f8 !important;
    border-color: #282828 !important;
    &:hover {
      border-color: @colorPrimary !important;
    }
    .anticon-loading,
    .anticon-plus {
      font-size: 18px;
    }
    .upload-slot {
      position: relative;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
  }
  :deep(.ant-upload-list-item-container) {
    width: 110px !important;
    height: 110px !important;
    position: relative;
    z-index: 2;
    border-radius: 8px;
    overflow: hidden !important;
    .ant-upload-list-item {
      background-color: #f7f9f8 !important;
      border-color: #282828 !important;
      padding: 0;
      &.ant-upload-list-item-error {
        border-color: #ff4d4f !important;
      }
      &::before {
        width: 100% !important;
        height: 100% !important;
        border-radius: 8px;
        overflow: hidden !important;
      }
      .anticon-loading,
      .anticon-plus {
        font-size: 18px;
      }
      .ant-upload-list-item-action .anticon-delete {
        position: relative;
        top: -3px;
      }
    }
  }
  .delete-img {
    background-color: rgba(0, 0, 0, 0.45);
    position: absolute;
    top: 1px;
    left: 1px;
    width: 108px;
    height: 108px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.7);
    &:hover {
      color: rgba(255, 255, 255, 1);
      .anticon-delete {
        color: rgba(255, 255, 255, 1);
      }
    }
    .anticon-delete {
      font-size: 17px;
      color: rgba(255, 255, 255, 0.8);
    }
    p {
      font-size: 13px;
      margin-top: 5px;
    }
  }
}

.avatar-images-uploader {
  :deep(.ant-upload) {
    border-radius: 50% !important;
  }
  .delete-img {
    border-radius: 50%;
  }
}
</style>
