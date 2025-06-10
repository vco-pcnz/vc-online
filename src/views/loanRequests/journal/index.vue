<template>
  <layout @search="reload" :tabNum="otherInfo?.num"></layout>
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

            <template v-if="column.dataIndex === 'cate'">
              {{ record.cate == 1 ? 'Journal' : 'Duration' }}
            </template>

            <template v-if="column.dataIndex === 'amount'">
              <vco-number :value="record.amount" :precision="2" size="fs_md" :end="true"></vco-number>
              <p>{{ record.addsub == 1 ? t('增加') : t('减少') }}</p>
            </template>

            <template v-if="column.dataIndex === 'status_name'">
              <div :style="{ color: colors[record.status_name] }">{{ record.status_name }}</div>
            </template>

            <template v-if="column.dataIndex === 'create_time'">
              <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
              <p v-else>--</p>
              <div class="loanRequestsMark" v-if="record.has_permission">{{ t('操作') }}</div>
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
import { projectJournal } from '@/api/project/loanRequests';
import layout from '../components/layout.vue';

const { t } = useI18n();

const { tableRef, pageObj, otherInfo, tableLoading, pageChange, tableData, getTableData } = useTableList(
  projectJournal,
  {
    limit: 10
  },
  false
);

const columns = reactive([
  { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
  { title: t('项目信息'), dataIndex: 'project_info', width: 200, align: 'left' },
  { title: t('借款人'), dataIndex: 'borrower', width: 200, align: 'left' },
  { title: 'Journal / Duration', dataIndex: 'cate', width: 160, align: 'center' },
  { title: t('类型'), dataIndex: 'type_name', width: 100, align: 'center' },
  { title: t('金额'), dataIndex: 'amount', width: 150, align: 'center' },
  { title: t('状态'), dataIndex: 'status_name', width: 150, align: 'center' },
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
  'FC REVIEW': '#d3a631',
  'FC PENDING REVIEW': '#d3a631',
  'DIRECTOR PENDING REVIEW': '#d3a631'
});

const rowClick = (record, index) => {
  return {
    onClick: () => {
      navigationTo(`/projects/journal?uuid=${record.project.uuid}`);
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
