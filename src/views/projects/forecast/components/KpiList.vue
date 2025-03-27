<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="950" :open="visible" title="KPI" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <a-spin :spinning="loading">
        <div class="content">
          <a-table :columns="columns" :data-source="data" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'ym'">
                {{ tool.monthYear(record.ym) }}
              </template>
              <template v-if="column.dataIndex === 'lm'">
                <div class="flex items-center gap-3"><vco-avatar :src="record.lm_avatar" :size="30"></vco-avatar>{{ record.lm_name }}</div>
              </template>
              <template v-if="column.dataIndex === 'amount' || column.dataIndex === 'est_amount'">
                <vco-number :value="record[column.dataIndex]" :precision="2" size="fs_md" prefix="" suffix=""></vco-number>
              </template>
              <template v-if="column.dataIndex === 'kpi'"> {{ record.kpi }}% </template>
            </template>
          </a-table>
        </div>
      </a-spin>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { kpiList } from '@/api/project/project';

const { t } = useI18n();

const props = defineProps({
  uuid: {
    type: String
  }
});

const visible = ref(false);
const loading = ref(false);
const data = ref([]);

const columns = reactive([
  { title: t('日期'), dataIndex: 'ym', width: 100, align: 'center' },
  { title: t('项目经理'), dataIndex: 'lm', width: 150, align: 'center' },
  { title: t('金额'), dataIndex: 'amount', width: 150, align: 'center' },
  { title: t('绩效指标预测'), dataIndex: 'est_amount', width: 150, align: 'center' },
  { title: 'Kpi', dataIndex: 'kpi', width: 100, align: 'center' },
  { title: t('备注'), dataIndex: 'note', width: 200, ellipsis: true }
]);

const updateVisible = (value) => {
  visible.value = value;
};

const loadData = () => {
  loading.value = true;

  kpiList({ uuid: props.uuid })
    .then((res) => {
      data.value = res;
    })
    .finally(() => {
      loading.value = false;
    });
};

const init = () => {
  visible.value = true;
  loadData();
};

// 暴露方法给父组件
defineExpose({
  init
});
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
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
