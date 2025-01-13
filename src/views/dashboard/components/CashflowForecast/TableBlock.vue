<template>
  <a-spin :spinning="loading">
    <div class="sys-table-content border-top-none pb-10">
      <a-table :columns="columns" :data-source="tableData" :pagination="false" :scroll="{ x: '100%' }" v-if="columns">
        <template #headerCell="{ title }">
          {{ tool.monthYear(title) }}
        </template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'name'">
            <template v-if="record.name === 'Repayments'">
              <i class="iconfont">&#xe757;</i>
            </template>
            <template v-if="record.name === 'Drawdowns'">
              <i class="iconfont">&#xe755;</i>
            </template>
            <template v-if="record.name === 'Available fund'">
              <i class="iconfont">&#xe766;</i>
            </template>
            <span class="name">{{ record.name }}</span>
          </template>
          <template v-else>
            <div class="flex justify-end" :class="{ bold: index == 2 || index == 3, isGreen: record.data[column.title] < 0 && index === 3 }">
              <template v-if="index === 1">
                <vco-number prefix="(" suffix=")" :value="record.data[column.title]" size="fs_md" :precision="2"></vco-number>
              </template>
              <template v-else-if="index === 2">
                <template v-if="record.data[column.title] < 0">
                  <vco-number prefix="(" suffix=")" :value="record.data[column.title]" size="fs_md" :precision="2"></vco-number>
                </template>
                <template v-else>
                  <vco-number prefix="" :value="record.data[column.title]" size="fs_md" :precision="2"></vco-number>
                </template>
              </template>
              <template v-else-if="index === 3">
                <template v-if="record.data[column.title] < 0">
                  <vco-number prefix="(" suffix=")" color="#6d7b1f" :value="record.data[column.title]" size="fs_md" :precision="2"></vco-number>
                </template>
                <template v-else>
                  <vco-number prefix="" :value="record.data[column.title]" size="fs_md" :precision="2"></vco-number>
                </template>
              </template>
              <template v-else>
                <vco-number prefix="" :value="record.data[column.title]" size="fs_md" :precision="2"></vco-number>
              </template>
            </div>
          </template>
        </template>
      </a-table>
      <!-- <vco-upload-modal></vco-upload-modal> -->
    </div></a-spin
  >
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { cloneDeep } from 'lodash';

const emits = defineEmits(['check']);

const props = defineProps({
  data: {
    type: Object
  }
});

const { t } = useI18n();

const loading = ref(false);
const columns = ref(null);

const tableData = ref([
  {
    name: 'Repayments',
    data: []
  },
  {
    name: 'Drawdowns',
    data: []
  },
  {
    name: 'Total',
    data: []
  },
  {
    name: 'Available fund',
    data: []
  }
]);

watch(
  () => props.data,
  (val) => {
    if (val) {
      loading.value = true;
      tableData.value = cloneDeep(val);
      columns.value = [{ title: '', key: 'name', minWidth: 150 }];
      Object.keys(val[0].data).forEach((item, index) => {
        columns.value.push({
          title: item,
          key: index,
          align: 'right'
        });
      });

      loading.value = false;
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
:deep(.ant-table) {
  tr {
    &:after {
      background: transparent !important;
      border: none !important;
    }
  }
  td,
  th {
    padding: 6px 8px !important;
    color: #181818;
    font-weight: 500;
    white-space: nowrap;
    .name {
      font-weight: 700;
    }
    .bold {
      .ant-statistic-content {
        font-weight: 700 !important;
      }
    }
    .isGreen {
      background-color: rgba(169, 173, 87, 0.2);
      border-radius: 8px;
      padding: 2px 6px;
    }
  }
  &:th-child(3) {
    border-top: 1px solid #181818 !important;
  }
}
.sys-table-content :deep(.ant-table-wrapper) .ant-table-thead > tr > th {
  color: #888 !important;
  font-size: 10px;
}
</style>
