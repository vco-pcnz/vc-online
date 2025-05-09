<template>
  <div>
    <div style="display: inline-block" @click="show">
      <slot>
        <a-button size="large" type="dark">
          {{ t('上传') }}
        </a-button>
      </slot>
    </div>
    <a-modal :width="600" v-if="open" :open="open" :title="t('上传')" @cancel="open = false" class="sys-form-content">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key="1" :tab="t('图片')" v-if="!uploadType || uploadType == 1">
          <vco-upload ref="vcoUpload1" :controller="controller" :params="params" type="image" :limit="20" isMultiple v-model:list="images"></vco-upload>
        </a-tab-pane>
        <a-tab-pane :key="2" :tab="t('文件')" v-if="!uploadType || uploadType == 2">
          <vco-upload ref="vcoUpload2" :controller="controller" :params="params" type="file" :limit="20" isMultiple v-model:list="files"></vco-upload>
        </a-tab-pane>
        <a-tab-pane :key="3" :tab="t('视频')" v-if="!uploadType || uploadType == 3">
          <vco-upload ref="vcoUpload3" :controller="controller" :params="params" type="video" :limit="20" isMultiple v-model:list="videos"></vco-upload>
        </a-tab-pane>
      </a-tabs>
      <template #footer>
        <div class="modal-footer">
          <a-button @click="confirm" size="large" type="primary" style="width: 40%">
            {{ t('确认') }}
          </a-button>
        </div>
      </template>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';

const { t } = useI18n();

const props = defineProps({
  value: {
    type: Array,
    required: false
  },
  list: {
    type: Array,
    required: false
  },
  controller: {
    type: String,
    default: '/upload'
  },
  // 后端要求携带的其他参数
  params: {
    type: Object,
    required: false,
    default: () => {
      return {};
    }
  },
  defaultUploadType: {
    type: Number,
    default: 1
  },
  uploadType: {
    type: Number //1 image,2 file,3 video
  }
});
const emits = defineEmits(['update:value', 'update:list', 'change']);
const open = ref(false);
const activeKey = ref(1);
const images = ref([]);
const files = ref([]);
const videos = ref([]);

const show = () => {
  activeKey.value = props.defaultUploadType;
  if (props.uploadType) activeKey.value = props.uploadType;
  images.value = [];
  files.value = [];
  videos.value = [];
  open.value = true;
};

const confirm = () => {
  const list = [...props.list, ...images.value, ...files.value, ...videos.value];
  emits('update:list', list);
  emits('change', list);
  open.value = false;
};

watch(
  () => props.list,
  (val) => {
    if (val) {
      const formData = val.map((item) => {
        return item.uuid;
      });
      emits('update:value', formData);
    } else {
      emits('update:value', []);
    }
  },
  {
    immediate: true,
    deep: true
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.submit-btn:hover {
  color: @clr_white;
}

.modal-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
}

.modal-content {
  height: 70vh;
  overflow-y: auto;
}
.ant-tabs-tabpane {
  padding: 24px 0;
}
:deep(.ant-tabs-nav-wrap) {
  position: relative;
  z-index: 2;
}
</style>
