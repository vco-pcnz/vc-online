<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="900" :open="visible" title="view stake" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <a-table :columns="columns" :data-source="stake" :pagination="false" :scroll="{ x: '100%' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'avatar'">
              <div class="flex justify-center">
                <vco-avatar :size="36" :src="record.stake_avatar" :radius="true"></vco-avatar>
              </div>
            </template>
            <template v-if="column.dataIndex === 'amount'">
              <vco-number :value="record.amount" :precision="2" size="fs_md" class="mr-2"></vco-number>
            </template>
          </template>
        </a-table>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { loanDsaveStep } from '@/api/project/loan';
const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  stake: {
    type: Array
  }
});

const visible = ref(false);

const updateVisible = (value) => {
  visible.value = value;
};
const columns = reactive([
  { title: t('头像'), dataIndex: 'avatar', width: 100, align: 'center', ellipsis: true },
  { title: t('名称'), dataIndex: 'stake_name', width: 120, align: 'left', ellipsis: true },
  { title: t('金额'), dataIndex: 'amount', width: 180, align: 'center', ellipsis: true },
  { title: t('备注'), dataIndex: 'note', align: 'left', ellipsis: true }
]);

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
    .ant-input-number {
      border-color: #d9d9d9;
      &.err {
        border-color: #c1430c;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;
      .user-item {
        padding: 8px 10px;
        border-radius: 8px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .name {
          flex: 1;
          font-weight: bold;
        }
      }
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

  .input-item {
    margin-top: 20px;
  }
}
</style>
