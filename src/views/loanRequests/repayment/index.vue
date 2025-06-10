<template>
  <layout @search="reload" :params="{ type: 4 }"></layout>
  <div class="mt-5">
    <a-spin :spinning="tableLoading" size="large">
      <div class="table-content sys-table-content cursor-pointer">
        <a-table ref="tableRef" rowKey="uuid" :columns="columns" :data-source="tableDataRef" table-layout="fixed" :pagination="false" :customRow="rowClick">
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
            <template v-if="column.dataIndex === 'borrower'">
              <template v-if="record.project.showName">
                <div class="icon-txt">
                  <i class="iconfont" v-if="record.project.borrower_type == 1">&#xe632;</i>
                  <i class="iconfont" v-else>&#xe679;</i>
                  <span :title="record.project.project_city" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record.project.showName }}</span>
                </div>
                <div class="icon-txt" v-if="record.project.borrower_email">
                  <i class="iconfont">&#xe66f;</i>
                  <span :title="record.project.project_city" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record.project.borrower_email }}</span>
                </div>
                <div class="icon-txt" v-if="record.project.borrower_phone">
                  <i class="iconfont">&#xe678;</i>
                  <div class="inline-block" style="text-indent: 20px">
                    <span v-if="record.project.borrower_phone_prefix"> +{{ record.project.borrower_phone_prefix }}</span> {{ record.project.borrower_phone }}
                  </div>
                </div>
              </template>
            </template>

             <template v-if="column.dataIndex === 'all_repayment'">
              <span class="status-txt">{{ record.all_repayment ? t('全额还款') : t('部分还款') }}</span> 
            </template>

            <template v-if="column.dataIndex === 'apply_amount'">
              <vco-number :value="record.apply_amount" :precision="2" size="fs_xs" :end="true"></vco-number>
              <p class="fs_xs color_grey" v-if="record.date">{{ tool.showDate(record.date) }}</p>
            </template>
            <template v-if="column.dataIndex === 'status_name'">
              <div :style="{ color: colors[record.status_name] }">
                <template v-if="record.status == 2">
                  <p class="fs_xs bold" style="color: #181818">PAID</p>
                  <p class="fs_xs color_grey" v-if="record.open_date">{{ tool.showDate(record.open_date) }}</p>
                </template>
                <p v-else>{{ record.status_name }}</p>
              </div>
            </template>

            <template v-if="column.dataIndex === 'create_time'">
              <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
              <p v-else>--</p>
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
import { navigationTo } from '@/utils/tool';
import { projectLoan } from '@/api/project/loanRequests';
import layout from '../components/layout.vue';

const { t } = useI18n();

const { tableRef, pageObj, tableLoading, pageChange, tableData, getTableData } = useTableList(
  projectLoan,
  {
    limit: 10
  },
  false
);

const columns = reactive([
  { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
  { title: t('项目信息'), dataIndex: 'project_info', width: 200, align: 'left' },
  { title: t('借款人'), dataIndex: 'borrower', width: 200, align: 'left' },
  { title: t('还款'), dataIndex: 'name', width: 200, align: 'left' },
  { title: t('类型'), dataIndex: 'all_repayment', width: 150, align: 'left' },
  { title: t('请求数据'), dataIndex: 'apply_amount', width: 200, align: 'center' },
  { title: t('状态t'), dataIndex: 'status_name', align: 'center' },
  { title: t('创建时间'), dataIndex: 'create_time', width: 120, align: 'center' }
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
      item.project.showName = item.project.user_name;
    } else {
      item.project.showName = item.project.organization_name;
    }

    item.project.imgsArr = imgsArr;
  });
  return data;
});

const colors = ref({
  'DRAWDOWN CONFIRM': '#a9ad57',
  'LM REVIEW': '#d3a631',
  'LM PENDING REVIEW': '#d3a631',
  'FC REVIEW': '#d3a631',
  'PENDING APPROVAL…': '#d3a631',
  'FC PENDING REVIEW': '#d3a631'
});

const rowClick = (record, index) => {
  return {
    onClick: () => {
      navigationTo(`/projects/repayments?uuid=${record.project.uuid}`);
    }
  };
};

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
