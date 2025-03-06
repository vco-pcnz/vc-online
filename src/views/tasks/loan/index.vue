<template>
  <div>
    <vco-page-nav sup-path="/tasks"></vco-page-nav>
    <bind-users-dialog v-model:visible="showDialog" :type="1" :p-ids="pIds" :data="vcTeamObj" :vc-team="vcTeamData" @done="bindDone"></bind-users-dialog>

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
                <template v-if="record.imgsArr.length">
                  <div class="flex justify-center">
                    <vco-avatar :src="record.imgsArr[0]" :radius="true" :round="false"></vco-avatar>
                  </div>
                </template>
                <p v-else>--</p>
              </template>
              <template v-if="column.dataIndex === 'project_info'">
                <span>
                  <div class="id-info">ID: {{ record.project_apply_sn }}</div>
                  <div :title="record.project_name">{{ record.project_name || t('项目名称') }}</div>
                  <div v-if="record.project_city && record.project_city.length > 3" class="icon-txt mt-1">
                    <i class="iconfont cer">&#xe814;</i>
                    <span :title="record.project_city" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-2">{{ record.project_city }}</span>
                  </div>
                </span>
              </template>
              <template v-if="column.dataIndex === 'loan_money'">
                <span>
                  <vco-number v-if="record.loan_money" :value="record.loan_money" :precision="2"></vco-number>
                  <p v-else>--</p>
                </span>
              </template>
              <template v-if="column.dataIndex === 'status'">
                <span>{{ t(record.status_name) }}</span>
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
import { reactive, computed, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { processRoutes } from '@/constant';
import { useTableList } from '@/hooks/useTableList';
import { navigationTo } from '@/utils/tool';
import { requestBacklogList } from '@/api/tasks';
import { associateSystemConfig } from '@/api/process';
import BindUsersDialog from '@/views/process/components/BindUsersDialog.vue';
import emitter from '@/event';
import { useUserStore } from '@/store';

const { t } = useI18n();

const userStore = useUserStore();

const { tableRef, tableLoading, tableData, getTableData } = useTableList(requestBacklogList, {
  limit: 1000
});

const columns = reactive([
  { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
  { title: t('项目信息'), dataIndex: 'project_info', width: 300, align: 'left' },
  { title: t('借款金额'), dataIndex: 'loan_money', width: 200, align: 'left' },
  { title: t('状态'), dataIndex: 'status', width: 200, align: 'center' },
  { title: t('创建时间'), dataIndex: 'create_time', width: 200, align: 'center' },
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
    const images = item.project_image || '';
    let imgsArr = [];
    if (images) {
      imgsArr = images.split(',');
    }

    if (item.borrower_type === 1) {
      item.showName = `${item.first_name} ${item.middle_name} ${item.last_name}`;
    } else {
      item.showName = item.organization_name;
    }

    item.imgsArr = imgsArr;
  });
  return data;
});

const vcTeamObj = ref(null);
const vcTeamData = ref([]);
const showDialog = ref(false);
const pIds = ref([]);

const bindHandle = (data) => {
  pIds.value = data ? [data.uuid] : selectedRowKeys.value;
  vcTeamObj.value['alm'] = data ? data.alm_list : [];
  showDialog.value = true;
};

const bindDone = () => {
  userStore.getTaskNumInfo()
  
  getTableData(true);

  emitter.emit('refreshRequestsList')
};

const getVcteamData = () => {
  associateSystemConfig().then((res) => {
    vcTeamData.value = res || [];
    const vcTeamArr = vcTeamData.value.map((item) => item.code);

    const vcObj = {};

    for (let i = 0; i < vcTeamArr.length; i++) {
      vcObj[vcTeamArr[i]] = [];
    }

    vcTeamObj.value = vcObj;
  });
};

const todoHandle = (data) => {
  if (data.status_name === 'LC 分配 LM') {
    bindHandle(data)
  } else {
    const href = processRoutes[data.next_index - 1];
    if (href) {
      navigationTo(`${href}?uuid=${data.uuid}`);
    }
  }
}

onMounted(() => {
  getVcteamData();
})

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
