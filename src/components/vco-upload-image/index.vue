<template>
  <div>
    <a-upload
      :action="uploadAction"
      list-type="picture-card"
      class="images-uploader"
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
        style="height: 85px; width: 85px"
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
    <span class="delete-img" @click="deleteImg" v-if="picUrl && limit == 1">
      <!-- <img :src="deleteImgSrc" /> -->
      <div>删除</div>
    </span>
    <a-modal
      :visible="previewVisible"
      :footer="null"
      @cancel="previewHandleCancel"
    >
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup name="UploadImage">
  import { ref, onMounted } from 'vue';
  import { PlusOutlined, LoadingOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue/es';
  import { useI18n } from 'vue-i18n';
  import { getToken } from '@/utils/token-util';
  // import { API_BASE_URL } from '@/config/setting';
  import { cloneDeep } from 'lodash';

  const API_BASE_URL = '/api'

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

  const uploadAction = API_BASE_URL + '/upload/uploadImage';
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
        return API_BASE_URL + '/uploads/' + avatar;
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
        item.push(uploadFiles[i].response.data);
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

  onMounted(() => {
    const token = getToken();
    headers.value = { Authorization: token };

    const data = cloneDeep(props.value);
    if (data) {
      if (data instanceof Array) {
        initFileList(data.join(','));
      } else {
        initFileList(data);
      }
    } else {
      fileList.value = [];
    }
  });
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  :deep(.images-uploader) {
    .ant-upload {
      width: 128px !important;
      height: 128px !important;
      background-color: #f7f9f8 !important;
      border-color: #282828 !important;
      &:hover {
        border-color: @colorPrimary !important;
      }
    }
  }
  // .images-uploader {
  //   .ant-upload {
  //     width: 128px;
  //     height: 128px;
  //     background-color: #f7f9f8;
  //   }
  // }
  // .avatar-uploader > .ant-upload {
  //   width: 128px;
  //   height: 128px;
  // }
  // .ant-upload-select-picture-card i {
  //   font-size: 32px;
  //   color: #999;
  // }

  // .ant-upload-select-picture-card .ant-upload-text {
  //   margin-top: 8px;
  //   color: #666;
  // }
  // .delete-img {
  //   display: inline-block;
  //   position: absolute;
  //   left: 105px;
  //   top: 10px;
  //   font-size: 20px;
  //   z-index: 999;
  // }
  // .delete-img img {
  //   position: absolute;

  //   right: -10px;
  //   top: -10px;
  //   width: 25px;
  //   height: 25px;
  //   display: inline-block;
  // }
  // .delete-img:hover {
  //   color: #fff;
  // }

  // .ant-upload.ant-upload-select {
  //   background-color: #f7f9f8;
  // }
</style>
