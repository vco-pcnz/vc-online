<template>
  <div>
    <div style="display: inline-block" @click="show">
      <slot>
        <a-button size="large" type="dark"> {{ t('上传') }}</a-button>
      </slot>
    </div>
    <a-modal :width="662" v-if="open" :open="open" :title="t('上传')" @cancel="open = false" class="sys-form-content">
      <p class="fs_xs color_grey mt-5 mb-6 pb-1" style="border-bottom: 1px solid #ababab">{{ t('单击或将文件拖到当前页面进行上传') }}</p>
      <vco-upload :controller="controller" :params="params" :type="type" :limit="limit" isMultiple v-model:list="files" v-model:loading="uploading"></vco-upload>
      <template #footer>
        <div class="modal-footer">
          <a-button @click="confirm" :disabled="uploading" size="large" type="primary" style="width: 40%">
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
  type: {
    type: String
  },
  // 多图情况下限制图片张数
  limit: {
    type: Number,
    required: false,
    default: 99
  }
});
const emits = defineEmits(['update:value', 'update:list', 'change']);
const uploading = ref(false);
const open = ref(false);
const files = ref([]);

const show = () => {
  files.value = [];
  open.value = true;
};

const confirm = () => {
  const list = [...props.list, ...files.value];
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
