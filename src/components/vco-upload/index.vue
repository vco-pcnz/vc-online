<template>
  <div class="images-uploader">
    <a-upload
      ref="uploadRef"
      :action="uploadAction"
      list-type="picture-card"
      :disabled="disabled"
      :headers="headers"
      :file-list="fileList"
      :beforeUpload="beforeUpload"
      :data="{ biz: bizPath }"
      :name="fileName"
      :multiple="isMultiple"
      :showUploadList="type !== 'image' || isMultiple"
      :accept="accept"
      @preview="handlePreview"
      @change="handleChange"
    >
      <img v-if="type == 'image' && !isMultiple && picUrl" :src="getAvatarView()" />
      <div v-else-if="(isMultiple && fileList.length < limit && !disabled) || (!isMultiple && !picUrl)">
        <loading-outlined v-if="loading" />
        <plus-outlined v-else />
        <div class="ant-upload-text">{{ t(text || upText) }}</div>
      </div>
    </a-upload>
    <div class="delete-img" @click="deleteImg" v-if="type == 'image' && picUrl && limit == 1 && !isMultiple">
      <DeleteOutlined />
      <p>{{ t('删除') }}</p>
    </div>
    <a-modal v-model:open="previewVisible" :footer="null" @cancel="previewHandleCancel">
      <div style="padding-top: 30px">
        <img alt="example" v-if="props.type == 'image'" style="width: 100%" :src="previewSrc" />
        <video v-if="props.type == 'video'" style="width: 100%" :src="previewSrc"></video>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue/es';
import { useI18n } from 'vue-i18n';
import { getToken } from '@/utils/token-util';
import { cloneDeep } from 'lodash';

const uploadUrl = import.meta.env.VITE_APP_OPEN_PROXY === 'true' ? import.meta.env.VITE_APP_PROXY_PREFIX : import.meta.env.VITE_APP_BASE_URL;

const { t } = useI18n();

const emits = defineEmits(['update:value', 'change', 'update:list']);

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  // 父组件传进来的已有的图片数据
  value: {
    type: [String, Array],
    required: false
  },
  type: {
    type: String,
    required: false,
    default: 'image'
  },
  // 后端要求携带的其他参数
  bizPath: {
    type: String,
    required: false,
    default: 'temp'
  },
  // 只能查看不可上传和删除时开启该属性
  disabled: {
    type: Boolean,
    required: false,
    default: false
  },
  // 是否多图
  isMultiple: {
    type: Boolean,
    required: false,
    default: false
  },
  // 多图情况下限制图片张数
  limit: {
    type: Number,
    required: false,
    default: 1
  },
  maxSize: {
    type: Number,
    required: false,
    default: 50 // 100 MB
  }
});

const uploadAction = ref('');
const headers = ref({ 'Content-Type': 'multipart/form-data' });
const fileType = ref([]);
const errTip = ref('');
const accept = ref('');
const fileName = ref('file');
const upText = ref('');
// 上传文件类型
watch(
  () => props.type,
  (val) => {
    // 不同类型 上传地址处理
    switch (val) {
      case 'image':
        accept.value = 'image/*';
        uploadAction.value = uploadUrl + '/upload/uploadImage';
        fileType.value = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];
        errTip.value = t('上传图片的格式不正确，不是JPG、JPEG、GIF、PNG、BMP');
        upText.value = '上传图片';
        break;
      case 'video':
        accept.value = 'video/*';
        uploadAction.value = uploadUrl + '/upload/uploadVideo';
        fileType.value = ['mp4', 'rmvb', 'wmv', 'avi', 'mpeg', 'mpg', 'mov', '3gp', 'flv', 'mkv', 'm4v'];
        errTip.value = t('上传视频的格式不正确，不是MP4、RMVB、WMV、AVI、MPEG、MPG、MOV、3GP、FLV、MKV、M4V');
        fileName.value = 'video';
        upText.value = '上传视频';
        break;
      case 'file':
        accept.value = '';
        uploadAction.value = uploadUrl + '/upload/uploadFile';
        fileType.value = ['xls', 'xlsx', 'csv', 'json', 'txt', 'doc', 'docx', 'ppt', 'pptx', 'pdf', 'xmind'];
        errTip.value = t('上传文件的格式不正确，不是XLS、XLSX、CSV、JSON、TXT、DOC、DOCX、PPT、PPTX、PDF、Xmind');
        upText.value = '上传文件';
        break;
    }
  },
  {
    immediate: true
  }
);

const fileList = ref([]);

const previewSrc = ref('');
const previewVisible = ref(false);
const picUrl = ref(false);
const canClick = ref(true);
const loading = ref(false);

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

const uidGenerator = () => {
  return '-' + parseInt(String(Math.random() * 10000 + 1), 10);
};

const getFileName = (path) => {
  if (path.lastIndexOf('\\') >= 0) {
    let reg = new RegExp('\\\\', 'g');
    path = path.replace(reg, '/');
  }
  return path.substring(path.lastIndexOf('/') + 1);
};

const initFileList = (paths) => {
  picUrl.value = true;
  const list = [];
  const item = paths.split(',');
  for (let i = 0; i < item.length; i++) {
    let url = getFileAccessHttpUrl(item[i]);
    list.push({
      uid: uidGenerator(),
      name: getFileName(item[i]),
      status: 'done',
      url: url,
      response: {
        status: 'history',
        data: item[i]
      }
    });
  }
  fileList.value = list;
};

const initObjectFileList = (data) => {
  const idArr = data.map((item) => item.id || item.uuid);
  const list = data.map((item) => {
    return {
      uid: item.uuid || item.id || uidGenerator(),
      name: item.real_name || item.name || getFileName(item.url || item.value),
      status: 'done',
      url: item.url || item.value,
      size: item.size || 0,
      response: {
        status: 'history',
        data: item.url || item.value
      }
    };
  });

  fileList.value = list;
  emits('update:value', idArr);
};

const beforeUpload = (file, tips) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const isFileType = fileType.value.includes(fileExtension);
  if (!isFileType) {
    if (tips) {
      message.error(errTip.value);
      return false;
    }
  }
  const isLt2M = file.size / 1024 / 1024 < props.maxSize;
  if (!isLt2M) {
    if (tips) {
      message.error(t('大小不能超过{0}', [`${props.maxSize}MB`]));
      return false;
    }
  }
  return isFileType && isLt2M;
};

// 单文件上传删除
const deleteImg = (e) => {
  canClick.value = true;
  picUrl.value = false;
  fileList.value = [];
  emits('update:value', '');
  e.stopPropagation();
};

// 关闭弹框
const previewHandleCancel = () => {
  previewVisible.value = false;
};
// 预览
const handlePreview = (file) => {
  if (props.type == 'file') {
    window.open(file.url);
  } else {
    previewSrc.value = file.url || file.preview;
    previewVisible.value = true;
  }
};

const types = {
  image: 1,
  file: 2,
  video: 3
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
              type: types[props.type],
              uuid: uploadFiles[i].uid,
              size: uploadFiles[i].size,
              value: uploadFiles[i].url
            }
          : {
              name: uploadFiles[i].name,
              type: types[props.type],
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
};

// 上传
const handleChange = (info) => {
  picUrl.value = false;
  let list = info.fileList;

  if (info.file.status === 'done') {
    if (info.file.response.success) {
      picUrl.value = true;
      list = list.map((file) => {
        if (file.response) {
          file.url = getFileAccessHttpUrl(file.response.data);
        }
        return file;
      });
    }
  } else if (info.file.status === 'error') {
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

// 单图上传显示最新的一张
const getAvatarView = () => {
  if (fileList.value.length > 0) {
    let url = fileList.value[fileList.value.length - 1].url;
    return getFileAccessHttpUrl(url);
  }
};

const hasData = (data) => {
  if (data) {
    if (typeof data === 'string') {
      return !!data;
    } else if (data instanceof Array) {
      return data.length;
    } else {
      return Object.keys(data).length;
    }
  } else {
    return false;
  }
};

onMounted(() => {
  const token = getToken();
  headers.value = { Authorization: token };
});

watch(
  () => props.value,
  (val) => {
    if (hasData(val) && !fileList.value.length) {
      const data = cloneDeep(val);
      if (data instanceof Array) {
        if (data.length) {
          if (typeof data[0] === 'string') {
            initFileList(data.join(','));
          } else if ((data[0].uuid || data[0].id) && (data[0].url || data[0].value)) {
            initObjectFileList(data);
          }
        }
      } else if (typeof data === 'string') {
        initFileList(data);
      } else {
        initObjectFileList([data]);
      }
      handlePathChange();
    } else {
      fileList.value = [];
      picUrl.value = false
    }
  },
  {
    immediate: true,
    deep: true
  }
);
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
  }
  :deep(.ant-upload-list-item-container) {
    width: 110px !important;
    height: 110px !important;
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
