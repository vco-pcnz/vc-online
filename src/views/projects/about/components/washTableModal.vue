<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="1000" :open="visible" :title="t('利益相关者')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <WashTable target="about" :blockInfo="{ showEdit: true }" :washInfo="{ is_check: true }" :currentId="currentId"></WashTable>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import WashTable from '@/views/process/temp/default/components/WashTable.vue';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  currentId: {
    type: String
  }
});

const visible = ref(false);

const updateVisible = (value) => {
  visible.value = value;
};

const init = () => {
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 24px 72px;
      .label {
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
  }

  :deep(.block-item) {
    padding: 0;
    box-shadow: none;
    .target-content {
      display: none;
    }
    .process-title {
      justify-content: flex-end;
      & > .title {
        display: none;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
