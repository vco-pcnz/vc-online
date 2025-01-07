<template>
  <div @click.stop="updateVisible(true)"><slot></slot></div>
  <div @click.stop ref="renameRef" class="rename">
    <a-modal
      :width="486"
      :open="visible"
      title="Rename document"
      :getContainer="() => $refs.renameRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content">
        <div class="title" :class="{ err: !rename }">Name</div>
        <a-input v-model:value="rename" :addon-after="'.' + suffix" />
        <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
          {{ t('保存') }}
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { frename } from '@/api/project/annex';

const { t } = useI18n();
const emits = defineEmits(['update:visible', 'change']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  formParams: {
    type: Object,
    default: ''
  }
});

const loading = ref(false);
const rename = ref('');
const suffix = ref('');

const updateVisible = (value) => {
  emits('update:visible', value);
};

const save = () => {
  if (!rename.value) return message.error(t('请输入') + t('名称'));
  loading.value = true;
  let params = {
    ...props.formParams,
    name: rename.value
  };
  frename(params)
    .then((res) => {
      emits('change');
      rename.value = '';
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      rename.value = props.formParams.name.split('.')[0];
      suffix.value = props.formParams.name.split('.')[1];
    }
  },
  {
    immediate: true
  }
);
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.rename {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 24px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
      .title {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }
      .ant-input {
        padding: 13.7px 11px;
        transition: all 0.3s;
        border: none;
        outline: none;
        background-color: transparent;
        box-shadow: 0 0 2px #181818 !important;
      }
      .ant-input-group-addon {
        border: none;
        background: transparent;
      }

      .ant-input-group {
        border: 1px solid #181818;
        border-radius: 8px;
      }
      .save {
        width: 100%;
        margin-top: 24px;
      }
    }
  }
}
</style>
