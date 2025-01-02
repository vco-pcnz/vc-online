<template>
  <div @click="updateVisible(true)"><slot></slot></div>
  <div ref="renameRef" class="rename">
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
        <div class="title" :class="{ err: !rename }">Title</div>
        <a-input v-model:value="rename" />
        <a-button @click="save" type="dark" class="save big" :loading="loading">
          {{ t('保存') }}
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { getTree } from '@/api/project/annex';

const { t } = useI18n();
const emits = defineEmits(['update:visible', 'change']);

const props = defineProps({ visible: Boolean, default: false });

const loading = ref(false);
const rename = ref('');

const updateVisible = (value) => {
  emits('update:visible', value);
};

const save = () => {};
</script>
<style lang="less">
@import '@/styles/variables.less';

.rename {
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
  .ant-input {
    background-color: #f7f9f8;
    padding: 13.7px 11px;
    transition: all 0.3s;
  }
  .save {
    width: 100%;
    margin-top: 24px;
  }
}
</style>
