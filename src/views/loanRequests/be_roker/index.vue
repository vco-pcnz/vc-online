<template>
  <applyBrokerDetail ref="applyBrokerDetailRef" :detailData="applyBrokerDetail?.data" :apply_user="applyBrokerDetail?.user" :process="applyBrokerDetail" :has_permission="true" @update="getTableData()"></applyBrokerDetail>
  <layout @search="reload"></layout>
  <div class="mt-5">
    <a-spin :spinning="tableLoading" size="large">
      <div class="table-content sys-table-content no-top-line">
        <a-table ref="tableRef" rowKey="uuid" :columns="columns" :data-source="tableData" :pagination="false">
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'process_type'">
              <span>
                <div>{{ record.name }}</div>
                <div class="icon-txt mt-1">
                  <i class="iconfont cer">&#xe632;</i>
                  <span style="display: block">{{ record.user.user_name }}</span>
                </div>
              </span>
            </template>
            <template v-if="column.dataIndex === 'create_time'">
              <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
              <p v-else>--</p>
            </template>

            <template v-if="column.dataIndex === 'status_name'">
              <div :style="{ color: colors[record.status_name] }">{{ record.status_name }}</div>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <a-button type="primary" size="small" shape="round" class="uppercase" @click="todoHandle(record)">{{ t('点击处理') }}</a-button>
            </template>
          </template>
        </a-table>
      </div>
      <div v-if="tableData.length" class="mt-5">
        <a-pagination size="small" :total="pageObj.total" :current="pageObj.currentPage" :page-size="pageObj.pageSize" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="pageChange" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { useTableList } from '@/hooks/useTableList';
import { brokerIndex } from '@/api/project/loanRequests';
import layout from '../components/layout.vue';
import ApplyBrokerDetail from '@/views/profile/apply-broker/detail.vue';

const { t } = useI18n();

const { tableRef, pageObj, tableLoading, pageChange, tableData, getTableData } = useTableList(
  brokerIndex,
  {
    limit: 10
  },
  false
);

const columns = reactive([
  { title: t('标题'), dataIndex: 'process_type', align: 'left' },
  { title: t('状态t'), dataIndex: 'status_name', width: 220, align: 'center' },
  { title: t('创建时间'), dataIndex: 'create_time', width: 200, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 110
  }
]);

const todoHandle = (val) => {
  if (val) {
    showApplyBrokerDetail(val);
  }
};

const applyBrokerDetailRef = ref();
const applyBrokerDetail = ref({});
const showApplyBrokerDetail = (val) => {
  applyBrokerDetail.value = val;
  applyBrokerDetailRef.value.updateVisible(true);
};
const colors = ref({
  'LC REVIEW': '#d3a631',
  'DISCHARGE CONFIRM': 'rgb(11, 218, 142)'
});


const reload = (val) => {
  getTableData(val);
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.table-content {
  width: 100%;
  min-height: 300px;
  :deep(.ant-statistic-content) {
    font-size: 15px !important;
    white-space: nowrap;
  }
}

.id-info {
  color: @colorPrimary;
  margin-bottom: 5px;
}

.icon-txt {
  position: relative;
  > .iconfont {
    color: #999;
    position: absolute;
    left: 0;
    line-height: 21px;
    &.cer {
      color: @colorPrimary;
    }
  }
  > span {
    text-indent: 20px;
    color: #666;
    &.cer {
      color: #282828;
    }
  }
}

.status-txt {
  color: @colorPrimary;
}
</style>
