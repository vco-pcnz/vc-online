<template>
  <div>
    <vco-page-nav sup-path="/tasks"></vco-page-nav>

    <div class="mt-5">
      <a-spin :spinning="tableLoading" size="large">
        <div class="table-content sys-table-content no-top-line">
          <a-table
            ref="tableRef"
            rowKey="uuid"
            :columns="columns"
            :data-source="tableDataRef"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'project_info'">
                <span class="cursor-pointer" @click="todoHandle(record.project.uuid)">
                  <div class="id-info">ID: {{ record.project.project_apply_sn }}</div>
                  <div :title="record.project.project_name">{{ record.project.project_name || t('项目名称') }}</div>
                  <div v-if="record.project.project_city && record.project.project_city.length > 3" class="icon-txt mt-1">
                    <i class="iconfont cer">&#xe814;</i>
                    <span :title="record.project.project_city" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-2">{{ record.project.project_city }}</span>
                  </div>
                </span>
              </template>
              <template v-if="column.dataIndex === 'apply_amount'">
                <span class="cursor-pointer" @click="todoHandle(record.project.uuid)">
                  <vco-number v-if="record.apply_amount" :value="record.apply_amount" :precision="2"></vco-number>
                  <p v-else>--</p>
                </span>
              </template>
              <template v-if="column.dataIndex === 'create_time'">
                <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a-button
                  type="primary" size="small" shape="round" class="uppercase"
                  @click="todoHandle(record.project.uuid)"
                >{{ t('点击前往') }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
        <div v-if="tableData.length" class="mt-5">
          <a-pagination
            size="small"
            :total="pageObj.total"
            :current="pageObj.currentPage"
            :page-size="pageObj.pageSize"
            show-size-changer
            show-quick-jumper
            :show-total="(total) => t('共{0}条', [total])"
            @change="pageChange"
          />
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { useTableList } from '@/hooks/useTableList';
import { navigationTo } from '@/utils/tool';
import { getTasksList } from '@/api/tasks';

const { t } = useI18n();

const { tableRef, tableLoading, pageObj, tableData, pageChange } = useTableList(getTasksList, {
  process_type: 'drawdown'
});

const columns = reactive([
  { title: t('项目信息'), dataIndex: 'project_info', width: 300, align: 'left' },
  { title: t('申请金额'), dataIndex: 'apply_amount', width: 200, align: 'center' },
  { title: t('创建时间'), dataIndex: 'create_time', width: 200, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 110,
  },
]);

const tableDataRef = computed(() => {
  const data = tableData.value;
  data.forEach((item) => {
    if (item.project.borrower_type === 1) {
      item.project.showName = `${item.project.first_name} ${item.project.middle_name} ${item.project.last_name}`;
    } else {
      item.project.showName = item.project.organization_name;
    }
  });
  return data;
});

const todoHandle = (uuid) => {
  navigationTo(`/projects/drawdowns?uuid=${uuid}`)
}

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
