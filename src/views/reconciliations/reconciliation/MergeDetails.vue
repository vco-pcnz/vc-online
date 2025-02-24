<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="modeRef" class="myMode">
    <a-modal :width="900" :open="visible" :title="t('合并详情')" :getContainer="() => $refs.modeRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content">
        <a-table :columns="columns" :data-source="list" :pagination="false" :scroll="{ x: '100%' }">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'project_name'">
              {{ item?.project.project_name }}
            </template>
            <template v-if="column.dataIndex === 'date'">
              <p class="xs_text">{{ tool.showDate(record.date) }}</p>
            </template>
          </template>
        </a-table>
        <div class="flex justify-end mt-5">
          <a-popconfirm :title="t('确定撤销合并吗？')" :ok-text="t('确定')" :cancel-text="t('取消')" @confirm="bindRevokeMerge()" :disabled="isDisabled">
            <a-button type="cyan" shape="round" size="small" :loading="loading" :disabled="isDisabled">{{ t('撤销合并') }}</a-button>
          </a-popconfirm>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { revokeMerge } from '@/api/reconciliations';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  item: {
    type: Object
  }
});

const visible = ref(false);

const list = ref([]);
const columns = reactive([
  { title: t('名称'), dataIndex: 'project_name', width: 180, align: 'left', ellipsis: true },
  {
    title: t('金额'),
    dataIndex: 'amount',
    width: 120,
    align: 'center',
    ellipsis: true,
    customRender: ({ record }) => {
      return tool.formatMoney(Math.abs(record.amount), { prefix: '' });
    }
  },
  { title: t('类型'), dataIndex: 'type', width: 120, align: 'center', ellipsis: true },
  { title: t('备注'), dataIndex: 'description', align: 'left', ellipsis: true },
  { title: t('日期'), dataIndex: 'date', width: 120, align: 'center', ellipsis: true }
]);

const updateVisible = (value) => {
  visible.value = value;
};
const init = () => {
  list.value = props.item?.children.map((sub) => {
    delete sub.children;
    return sub;
  });
  updateVisible(true);
};

const loading = ref(false);
const bindRevokeMerge = () => {
  loading.value = true;
  revokeMerge({ bank_sn: props.item?.bank_sn })
    .then((res) => {
      emits('update')
    })
    .finally(() => {
      loading.value = false;
    });
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.myMode {
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
    }
  }

  .iconfont.disabled {
    color: #888;
    cursor: not-allowed !important;
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
.input-item {
  margin-top: 20px;
}
.save {
  width: 100%;
  margin-top: 24px;
}
</style>
