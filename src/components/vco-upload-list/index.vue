<template>
  <div class="upload-list">
    <div v-for="(item, index) in documentList" :key="index" class="upload-list-item">
      <img :src="item.value" alt="" />
      <div class="delete-img">
        <span @click.stop="deleteImg(index)"><DeleteOutlined class="icon" /></span>
        <span @click.stop="handlePreview(item)"><EyeOutlined class="icon" /></span>
      </div>
    </div>
    <vco-upload-modal :type="type" v-model:list="documentList" :limit="limit" @change="update" v-if="limit>0">
      <div class="default">
        <plus-outlined />
        <div class="ant-upload-text">{{ t(text) }}</div>
      </div>
    </vco-upload-modal>
  </div>

  <a-modal v-model:open="previewVisible" :footer="null" @cancel="previewHandleCancel">
    <div style="height: 30px"></div>
    <img alt="example" style="width: 100%" :src="previewImage" />
  </a-modal>
</template>

<script setup>
import { ref, watch } from 'vue';
import { DeleteOutlined, PlusOutlined, EyeOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
const { t } = useI18n();

const emits = defineEmits(['update:value', 'update:list', 'change']);

const props = defineProps({
  text: {
    type: String,
    default: '上传图片'
  },
  // 父组件传进来的已有的图片数据

  value: {
    type: Array,
    required: false
  },
  list: {
    type: Array,
    required: false,
    default: []
  },
  type: {
    type: String, //1 image,2 file,3 video
    default: 'image'
  },
  // 多图情况下限制图片张数
  limit: {
    type: Number,
    required: false,
    default: 99
  }
});

const documentList = ref([]);
const previewVisible = ref(false);
const previewImage = ref(false);

// 关闭弹框
const previewHandleCancel = () => {
  previewVisible.value = false;
};

const deleteImg = (index) => {
  documentList.value.splice(index, 1);
  console.log(documentList.value)
  update();
};

// 预览
const handlePreview = (file) => {
  previewImage.value = file.url || file.value;
  previewVisible.value = true;
};

const update = () => {
  if (documentList.value.length) {
    const formData = documentList.value.map((item) => {
      return item.uuid;
    });
    emits('update:value', formData);
  } else {
    emits('update:value', []);
  }
  emits('update:list', documentList.value);
};

watch(
  () => props.value,
  () => {
    const isFrist = props.value.length && typeof props.value[0] !== 'string';
    if (isFrist) {
      documentList.value = cloneDeep(props.value || props.list);
      update();
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

.default {
  width: 110px;
  height: 110px;
  background-color: #f7f9f8;
  border: 1px dashed #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  border-radius: 8px;
  box-sizing: border-box;
  cursor: pointer;
  &:hover {
    border-color: @colorPrimary !important;
  }
}

.anticon-loading,
.anticon-plus {
  font-size: 18px;
}
.upload-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  .upload-list-item {
    width: 110px;
    height: 110px;
    border-radius: 8px;
    background-color: #f7f9f8 !important;
    position: relative;
    border: 1px solid #282828;
    overflow: hidden;
    box-sizing: border-box;

    img {
      position: static;
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .delete-img {
      background-color: rgba(0, 0, 0, 0.45);
      position: absolute;
      top: 0px;
      left: 0px;
      width: 110px;
      height: 110px;
      border-radius: 8px;
      display: none;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      gap: 8px;
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

    &:hover {
      .delete-img {
        display: flex;
      }
    }
  }
}
</style>
