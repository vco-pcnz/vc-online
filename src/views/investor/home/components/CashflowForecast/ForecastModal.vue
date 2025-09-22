<template>
  <div @click.stop ref="renameRef" class="forecast">
    <a-modal :open="visible" :title="'Cashflow forecast details for ' + (date ? tool.monthYearFull(date) : '')" :width="1000" :footer="null" :keyboard="false" :maskClosable="false" :getContainer="() => $refs.renameRef" @update:open="updateVisible">
      <a-spin :spinning="loading" size="large">
        <ForecastList :data="data" :total="total" @change="loadData"></ForecastList>
      </a-spin>
    </a-modal>
  </div>
</template>

<script setup>
import { watch, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { pick, cloneDeep } from 'lodash';
import { monthlyCashFlowList } from '@/api/invest';
import tool from '@/utils/tool';
import ForecastList from './ForecastList.vue';

const emits = defineEmits(['update:visible', 'update']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  date: {
    type: String
  },
  searchForm: {
    type: Object
  },
  invest_id: {
    type: String
  }
});

const { t } = useI18n();

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const total = ref(0);
const data = ref();
const loading = ref(false);
const loadData = (pagination) => {
  data.value = null;
  loading.value = true;
  pagination = pagination ? pagination : { page: 1, limit: 10 };
  monthlyCashFlowList({ search_key: props.date, ...pagination, ...props.searchForm, invest_id: props.invest_id })
    .then((res) => {
      total.value = res.count;
      data.value = res.data;
    })
    .finally(() => {
      loading.value = false;
    });
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      loadData();
    }
  }
);
</script>
<style lang="less" scoped>
.forecast {
  :deep(.ant-modal-header) {
    background: #fff;
    border-bottom: 0 solid #e2e5e2;
    border-radius: 8px 8px 0 0;
    color: #181818;
    padding: 72px 84px 24px;
    .ant-modal-title {
      word-wrap: break-word;
      color: inherit;
      font-size: 20px;
      font-weight: 500;
      line-height: 22px;
      margin: 0;
    }
  }
}
</style>
