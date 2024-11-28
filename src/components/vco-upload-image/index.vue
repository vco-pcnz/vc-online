<template>
  <div class="images-uploader">
    <a-upload
      :action="uploadAction"
      list-type="picture-card"
      :disabled="disabled"
      :headers="headers"
      :file-list="fileList"
      :beforeUpload="beforeUpload"
      :data="{ biz: bizPath }"
      :multiple="isMultiple"
      :showUploadList="isMultiple"
      accept="image/*"
      @preview="handlePreview"
      @change="handleChange"
    >
      <img
        v-if="!isMultiple && picUrl"
        :src="getAvatarView()"
      />
      <div
        v-else-if="
          (isMultiple && fileList.length < limit && !disabled) ||
          (!isMultiple && !picUrl)
        "
      >
        <loading-outlined v-if="loading" />
        <plus-outlined v-else />
        <div class="ant-upload-text">{{ t(text) }}</div>
      </div>
    </a-upload>
    <div class="delete-img" @click="deleteImg" v-if="picUrl && limit == 1 && !isMultiple">
      <DeleteOutlined />
      <p>{{ t('删除') }}</p>
    </div>
    <a-modal
      v-model:open="previewVisible"
      :footer="null"
      @cancel="previewHandleCancel"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup name="UploadImage">
  import { ref, onMounted, watch } from 'vue';
  import { DeleteOutlined, PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue/es';
  import { useI18n } from 'vue-i18n';
  import { getToken } from '@/utils/token-util';
  import { cloneDeep } from 'lodash';

  const uploadUrl = import.meta.env.VITE_APP_OPEN_PROXY === 'true' ? import.meta.env.VITE_APP_PROXY_PREFIX : import.meta.env.VITE_APP_BASE_URL

  const { t } = useI18n();

  const emits = defineEmits(['update:value', 'change']);

  const props = defineProps({
    text: {
      type: String,
      default: '上传图片'
    },
    // 父组件传进来的已有的图片数据
    value: {
      type: [String, Array],
      required: false
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
      default: 2 // 100 MB
    }
  });

  const uploadAction = uploadUrl + '/upload/uploadImage';
  const headers = ref({ 'Content-Type': 'multipart/form-data' });
  const fileList = ref([]);
  const previewImage = ref('');
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
    const idArr = data.map(item => item.id || item.uuid)

    const list = data.map(item => {
      return {
        uid: item.uuid || item.id || uidGenerator(),
        name: item.real_name || item.name || getFileName(item.url),
        status: 'done',
        url: item.url,
        response: {
          status: 'history',
          data: item.url
        }
      }
    })

    fileList.value = list;
    emits('update:value', idArr);
  }

  const beforeUpload = (file, tips) => {
    var fileType = file.type;
    if (fileType.indexOf('image') < 0) {
      if (tips) {
        message.warning(t('请上传图片'));
      }
      return false;
    }
    const isJPG =
      file.type === 'image/jpeg' ||
      file.type === 'image/jpg' ||
      file.type === 'image/png' ||
      file.type === 'image/bmp' ||
      file.type === 'image/gif';
    if (!isJPG) {
      if (tips) {
        message.error(t('上传图片的格式不正确，不是JPG、JPEG、GIF、PNG、BMP'));
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
    return isJPG && isLt2M;
  };

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
    previewImage.value = file.url || file.preview;
    previewVisible.value = true;
  };

  // 回传父组件
  const handlePathChange = () => {
    const uploadFiles = cloneDeep(fileList.value);

    let item = [];
    if (!props.isMultiple) {
      item = uploadFiles[uploadFiles.length - 1].response.data;
    } else {
      for (var i = 0; i < uploadFiles.length; i++) {
        const itemData = uploadFiles[i].response.status === 'history' ? uploadFiles[i].uid : uploadFiles[i].response.data
        item.push(itemData);
      }
    }
    emits('update:value', item);
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
      const index = info.fileList.findIndex(
        (item) => item.uid === info.file.uid
      );

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
        return !!data
      } else if (data instanceof Array) {
        return data.length
      } else {
        return Object.keys(data).length
      }
    } else {
      return false
    }
  }

  const notInit = ref(true)

  onMounted(() => {
    const token = getToken();
    headers.value = { Authorization: token };
  });

  watch(
    () => props.value,
    (val) => {
      if (hasData(val) && notInit.value) {
        notInit.value = false
        const data = cloneDeep(val);
        if (data) {
          if (data instanceof Array) {
            if (data.length) {
              if (typeof data[0] === 'string') {
                initFileList(data.join(','));
              } else if ((data[0].uuid || data[0].id ) && data[0].url) {
                initObjectFileList(data)
              }
            }
          } else if(typeof data === 'string') {
            initFileList(data);
          } else {
            initObjectFileList([data])
          }
        } else {
          fileList.value = [];
        }
      }
    },
    {
      immediate: true
    }
  )
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