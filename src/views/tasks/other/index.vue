<template>
  <div>
    <vco-page-nav sup-path="/tasks"></vco-page-nav>

    <div class="mt-5">
      <a-spin :spinning="tableLoading" size="large">
        <div class="table-content sys-table-content no-top-line">
          <a-table ref="tableRef" rowKey="uuid" :columns="columns" :data-source="tableData" :pagination="false">
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'create_time'">
                <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'note'">
                <span v-if="record.create_time">{{ record.note || '--'}}</span>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a-button type="primary" size="small" shape="round" class="uppercase" @click="todoHandle(record)">{{ t('点击处理') }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
        <!-- <div v-if="tableData.length" class="mt-5">
          <a-pagination size="small" :total="pageObj.total" :current="pageObj.currentPage" :page-size="pageObj.pageSize" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="pageChange" />
        </div> -->
      </a-spin>
    </div>
  </div>
  <applyBrokerDetail ref="applyBrokerDetailRef" :detailData="applyBrokerDetail?.apply_info" :apply_user="applyBrokerDetail?.apply_user" :process="applyBrokerDetail" :has_permission="true" @update="getTableData()"></applyBrokerDetail>
</template>

<script setup>
import { reactive, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { useTableList } from '@/hooks/useTableList';
import { navigationTo } from '@/utils/tool';
import { backlogOtherList } from '@/api/tasks';
import ApplyBrokerDetail from '@/views/profile/apply-broker/detail.vue';

const { t } = useI18n();

const { tableRef, tableLoading, pageObj, tableData, getTableData } = useTableList(backlogOtherList);

const columns = reactive([
  { title: t('标题'), dataIndex: 'process_type', width: 300, align: 'left' },
  { title: t('说明'), dataIndex: 'note' },
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
</style>
