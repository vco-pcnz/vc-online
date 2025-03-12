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
            table-layout="fixed"
            :pagination="false"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'project_image'">
                <template v-if="record.project.imgsArr.length">
                  <div class="flex justify-center">
                    <vco-avatar :src="record.project.imgsArr[0]" :radius="true" :round="false"></vco-avatar>
                  </div>
                </template>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'project_info'">
                <span>
                  <div class="id-info">ID: {{ record.project.project_apply_sn }}</div>
                  <div :title="record.project.project_name">{{ record.project.project_name || t('项目名称') }}</div>
                  <div v-if="record.project.project_city && record.project.project_city.length > 3" class="icon-txt mt-1">
                    <i class="iconfont cer">&#xe814;</i>
                    <span :title="record.project.project_city" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-2">{{ record.project.project_city }}</span>
                  </div>
                </span>
              </template>
              <template v-if="column.dataIndex === 'process_type'">
                <span v-if="typeData[record.process_type]" class="status-txt">{{ typeData[record.process_type] }}</span>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <vco-number v-if="record.amount" :value="record.amount" :precision="2" size="fs_md" :end="true"></vco-number>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'note'">
                <span v-if="record.note">{{ record.note }}</span>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'create_time'">
                <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a-button
                  type="primary" size="small" shape="round" class="uppercase"
                  @click="todoHandle(record)"
                >{{ t('点击处理') }}</a-button>
              </template>
            </template>
          </a-table>
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
import { projectBacklogList } from '@/api/tasks';

const { t } = useI18n();

const { tableRef, tableLoading, tableData, getTableData } = useTableList(projectBacklogList, {
  limit: 1000
});

const typeData = reactive({
  drawdown: t('提款'),
  repayment: t('还款'),
  discharge: t('解押'),
  'penalty-start': t('罚息开始'),
  'penalty-end': t('罚息结束'),
  variation: t('变更1'),
  journal: t('平账'),
  closed: t('关账'),
  aml: t('反洗钱'),
  security: t('添加抵押物'),
  'closed-cancel': t('关账撤销'),
})

const columns = reactive([
  { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
  { title: t('项目信息'), dataIndex: 'project_info', width: 300, align: 'left' },
  { title: t('类型'), dataIndex: 'process_type', width: 140, align: 'left' },
  { title: t('金额'), dataIndex: 'amount', width: 140, align: 'left' },
  { title: t('说明'), dataIndex: 'note', width: 180, align: 'left' },
  { title: t('创建时间'), dataIndex: 'create_time', width: 140, align: 'center' },
  {
    title: t('操作1'),
    dataIndex: 'operation',
    fixed: 'right',
    align: 'center',
    width: 140,
  },
]);

const tableDataRef = computed(() => {
  const data = tableData.value;
  data.forEach((item) => {
    const images = item.project.project_image || '';
    let imgsArr = [];
    if (images) {
      imgsArr = images.split(',');
    }

    if (item.project.borrower_type === 1) {
      item.project.showName = `${item.project.first_name} ${item.project.middle_name} ${item.project.last_name}`;
    } else {
      item.project.showName = item.project.organization_name;
    }

    item.process_type = item.process_type.toLowerCase()
    item.project.imgsArr = imgsArr;
  });
  return data;
});

const todoHandle = (data) => {
  if (data.process_type === 'drawdown') {
    navigationTo(`/projects/drawdowns?uuid=${data.project.uuid}`);
  } else if (data.process_type === 'repayment') {
    navigationTo(`/projects/repayments?uuid=${data.project.uuid}`);
  } else if (data.process_type === 'discharge') {
    navigationTo(`/projects/discharge?uuid=${data.project.uuid}`);
  } else if (data.process_type === 'security') {
    navigationTo(`/projects/discharge?uuid=${data.project.uuid}&type=1`);
  } else if (['penalty-start', 'penalty-end'].includes(data.process_type)) {
    navigationTo(`/projects/penalty?uuid=${data.project.uuid}`);
  } else if (data.process_type === 'variation') {
    navigationTo(`/projects/variations?uuid=${data.project.uuid}`);
  } else if (data.process_type === 'journal') {
    navigationTo(`/projects/journal?uuid=${data.project.uuid}`);
  } else if (['closed', 'closed-cancel'].includes(data.process_type)) {
    navigationTo(`/projects/about?uuid=${data.project.uuid}`);
  } else if (data.process_type === 'aml') {
    navigationTo(`/projects/orgs?uuid=${data.project.uuid}&type=2`);
  }
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

.status-txt {
  color: @colorPrimary;
}
</style>
