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

            <template v-if="column.dataIndex === 'card_no'">
              <template v-if="cate == 4">
                {{ record?.data?.list.length }}
              </template>
              <template v-else>
                {{ record.card_no || record.data.card_no }}
              </template>
            </template>

            <template v-if="column.dataIndex === 'type'">
              <span class="status-txt" v-if="record.type == 16">
                {{ t('编辑抵押物') }}
              </span>
              <span class="status-txt" v-else-if="record.type == 14">
                {{ t('解押') }}
              </span>
              <span class="status-txt" v-else>
                {{ record.state2 === 1000 ? t('解押') : t('添加抵押物') }}
              </span>
            </template>

            <template v-if="column.dataIndex === 'amount'">
              <template v-if="cate == 4">
                <vco-number :value="record.data.repayment_amount" :precision="2" size="fs_md" :end="true"></vco-number>
              </template>
              <template v-else>
                <vco-number :value="record.amount || record.data.amount" :precision="2" size="fs_md" :end="true"></vco-number>
              </template>
            </template>

            <template v-if="column.dataIndex === 'status_name'">
              <div v-if="Number(record.is_repayment)" :style="{ color: '#0bda8e' }">Repayment Discharge</div>
              <div v-else :style="{ color: colors[record.status_name] }">{{ record.status_name }}</div>
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
import { projectDischarge, applyIndex, applyEditIndex } from '@/api/project/loanRequests';
import layout from '../components/layout.vue';

const { t } = useI18n();
const ajaxApi = ref(applyIndex); // 使用 ref
const { tableRef, pageObj, otherInfo, tableLoading, pageChange, tableData, getTableData, updateApi } = useTableList(
  ajaxApi,
  {
    limit: 10
  },
  false
);
const cate = ref('');

const columns = reactive([
  { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
  { title: t('项目信息'), dataIndex: 'project_info', width: 200, align: 'left' },
  { title: t('借款人'), dataIndex: 'borrower', width: 200, align: 'left' },
  // { title: t('名称'), dataIndex: 'security_name', width: 120 },
  { title: t('产权编号'), dataIndex: 'card_no', width: 100, align: 'center' },
  { title: t('类型'), dataIndex: 'type', width: 100, align: 'center' },
  { title: t('抵押物价值'), dataIndex: 'amount', width: 120, align: 'center' },
  { title: t('状态'), dataIndex: 'status_name', width: 220, align: 'center' },
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
  'FC PENDING REVIEW': '#d3a631'
});

const rowClick = (record, index) => {
  return {
    onClick: () => {
      if (record.type == 16) {
        navigationTo(`/projects/discharge/details/edit?p_uuid=${record.project.uuid}&id=${record.id}`);
      } else if (record.type == 14) {
        navigationTo(`/projects/discharge/details/discharge?p_uuid=${record.project.uuid}&id=${record.id}`);
      } else {
        if (record.state2 === 1000) {
          // 解押
          navigationTo(`/projects/discharge?uuid=${record.project.uuid}`, true);
        } else {
          // 添加抵押物
          navigationTo(`/projects/discharge/details/add?p_uuid=${record.project.uuid}&uuid=${record.uuid}`);
        }
      }
    }
  };
};

const reload = (val) => {
  cate.value = val.cate || 4;
  if (cate.value == 3) {
    updateApi(applyEditIndex);
  } else if (cate.value == 4) {
    updateApi(applyIndex);
  } else {
    updateApi(projectDischarge);
  }
  if (cate.value == 4) {
    columns[3].title = t('抵押物数量');
    columns[5].title = t('还款金额1');
  } else {
    columns[3].title = t('产权编号');
    columns[5].title = t('抵押物价值');
  }
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
