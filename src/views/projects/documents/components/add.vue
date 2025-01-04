<template>
  <div @click="updateVisible(true)"><slot></slot></div>
  <div ref="nameRef" class="addModel">
    <a-modal
      :width="486"
      :open="visible"
      :title="formParams && formParams.id === '0' ? 'Add folder' : 'Edit folder'"
      :getContainer="() => $refs.nameRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <div class="title" :class="{ err: !name }">Name</div>
        <a-input v-model:value="name" />
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
import { edit } from '@/api/project/annex';
import { message } from 'ant-design-vue/es';

const { t } = useI18n();
const emits = defineEmits(['update:visible', 'change']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  formParams: {
    type: Object
  }
});

const loading = ref(false);
const name = ref('');

const updateVisible = (value) => {
  emits('update:visible', value);
};

const save = () => {
  if (!name.value) return message.error(t('请输入') + t('名称'));
  loading.value = true;
  let params = {
    ...props.formParams,
    name: name.value
  };
  edit(params)
    .then((res) => {
      emits('change');
      updateVisible(false);
      name.value = '';
      message.success(t('保存成功'));
    })
    .finally((_) => {
      loading.value = false;
    });
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      name.value = props.formParams.name;
    }
  },
  {
    immediate: true
  }
);
</script>
<style lang="less">
@import '@/styles/variables.less';

.addModel {
  .ant-modal-header {
    padding: 72px 84px 24px;
    border-radius: 24px;
    .ant-modal-title {
      font-size: 20px;
      font-weight: 500;
    }
  }
  .ant-modal-content {
    padding: 0px !important;
  }
}

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
  .save {
    width: 100%;
    margin-top: 24px;
  }
}
</style>
