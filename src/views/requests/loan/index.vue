<template>
  <div>
    <bind-users-dialog v-model:visible="showDialog" :type="1" :p-ids="pIds" :data="vcTeamObj" :vc-team="vcTeamData" @done="bindDone"></bind-users-dialog>

    <!-- <vco-page-nav sup-path="/requests">
      <template #action>
        <a-button type="cyan" shape="round" @click="navigationTo('/process/one')">{{ t('发起借款申请') }}</a-button>
      </template>
    </vco-page-nav> -->
    <div class="page-tab-content">
      <div class="nav-content">
        <div v-for="item in productData" :key="item.uuid"
          class="nav-link" :class="{'active': item.uuid === currentProduct}"
          @click="productChange(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <div v-if="showCreate" class="handle-content">
        <a-button type="cyan" shape="round" @click="gotoProcess">{{ t('发起借款申请') }}</a-button>
      </div>
    </div>

    <div class="mt-5">
      <vco-page-tab :tabData="tabData" v-model:current="currentTab" @change="tabChange"></vco-page-tab>
      <table-search ref="tableSearchRef" @search="searchHandle" :current="currentTab"></table-search>
      <div class="mt-10">
        <vco-table-tool>
          <template #left>
            <a-button type="grey" v-permission="'requests:loan:allocateLm'" :disabled="!selectedRowKeys.length" class="uppercase" @click="bindHandle(false)">
              {{ t('分配LM') }}
            </a-button>
          </template>
          <template #right>
            <!-- <vco-table-layout-type v-model="tabLayout"></vco-table-layout-type> -->
            <vco-table-sort v-model="sortType" v-model:value="sortValue" :type-data="sortTypeData"></vco-table-sort>
          </template>
        </vco-table-tool>

        <div class="mt-5">
          <a-spin :spinning="tableLoading" size="large">
            <div class="table-content sys-table-content">
              <grid-block v-if="tabLayout"></grid-block>
              <a-table
                v-else
                ref="tableRef"
                rowKey="uuid"
                :columns="columns"
                :row-selection="{ selectedRowKeys: selectedRowKeys, columnWidth: 50, onChange: onSelectChange }"
                :data-source="tableDataRef"
                :pagination="false"
                table-layout="fixed"
                :scroll="{ x: '100%' }"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'project_image'">
                    <template v-if="record.imgsArr.length">
                      <div class="flex justify-center cursor-pointer" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">
                        <vco-avatar :src="record.imgsArr[0]" :radius="true" :round="false"></vco-avatar>
                      </div>
                    </template>
                    <p v-else>--</p>
                  </template>
                  <template v-if="column.dataIndex === 'project_info'">
                    <span class="cursor-pointer" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">
                      <div :title="record.project_name" class="black bold">{{ record.project_name || t('项目名称') }}</div>
                      <div>ID: {{ record.project_apply_sn }}</div>
                      <div v-if="record.project_city && record.project_city.length > 3" class="icon-txt mt-1">
                        <i class="iconfont cer">&#xe814;</i>
                        <span :title="record.project_city" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-2">{{ record.project_city }}</span>
                      </div>
                    </span>
                  </template>
                  <template v-if="column.dataIndex === 'loan_money'">
                    <span class="cursor-pointer" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">
                      <vco-number v-if="record.loan_money" :value="record.loan_money" :precision="2"></vco-number>
                      <p v-else>--</p>
                    </span>
                  </template>
                  <template v-if="column.dataIndex === 'borrower_info'">
                    <div class="icon-txt cursor-pointer" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">
                      <i class="iconfont cer">{{ record.borrower_type === 1 ? '&#xe632;' : '&#xe683;' }}</i>
                      <span :title="record.showName" class="cer text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record.showName || '--' }}</span>
                    </div>
                    <div class="icon-txt mt-1.5 cursor-pointer" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">
                      <i class="iconfont" :class="{ cer: record.borrower_ver }">&#xe66f;</i>
                      <span :class="{ cer: record.borrower_ver }" :title="record.borrower_email" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">
                        {{ record.borrower_email || '--' }}
                      </span>
                    </div>
                    <div class="icon-txt cursor-pointer" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">
                      <i class="iconfont" :class="{ cer: record.borrower_ver }">&#xe678;</i>
                      <span :class="{ cer: record.borrower_ver }" :title="record.borrower_phone" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">
                        {{ record.borrower_phone || '--' }}
                      </span>
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'lm'">
                    <div class="user-content cursor-pointer" v-if="record.lm_list && record.lm_list.length" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">
                      <vco-user-item v-for="(item, index) in record.lm_list" :key="index" :data="item"></vco-user-item>
                    </div>
                    <p v-else>--</p>
                  </template>
                  <template v-if="column.dataIndex === 'term'">
                    <vco-time-line class="cursor-pointer" v-if="record.start_date && record.end_date" :open-date="record.start_date" :maturity-date="record.end_date" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)" ></vco-time-line>
                    <p v-else>--</p>
                  </template>
                  <!-- <template v-if="column.dataIndex === 'lvr'">
                    <span v-if="record.lvr">{{ record.lvr }}</span>
                    <p v-else>--</p>
                  </template> -->
                  <template v-if="column.dataIndex === 'create_time'">
                    <span v-if="record.create_time" class="cursor-pointer" @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">{{ tool.showDate(record.create_time) }}</span>
                    <p v-else>--</p>
                  </template>
                  <template v-if="column.dataIndex === 'status'">
                    <template v-if="record.status_name === 'LC 分配 LM'">
                      <a-button v-if="hasPermission('requests:loan:allocateLm')" type="primary" shape="round" @click="bindHandle(record)">{{ t('分配LM') }}</a-button>
                      <p v-else>{{ isNormalUser ? t('待审核') : t('等待分配LM') }}</p>
                    </template>
                    <template v-else>
                      <a-button v-if="record.has_permission" type="primary" shape="round" @click="itemHandle(record)">{{ t(record.status_name) }}</a-button>
                      <p v-else>{{ t(record.status_name) }}</p>
                    </template>
                  </template>
                  <template v-if="column.dataIndex === 'operation'">
                    <a-dropdown :trigger="['click']">
                      <a class="ant-dropdown-link" @click.stop>
                        <i class="iconfont cert">&#xe77a;</i>
                      </a>
                      <template #overlay>
                        <a-menu :selectable="false">
                          <a-menu-item key="0">
                            <a @click="navigationTo(`/requests/details/about?uuid=${record.uuid}`)">{{ t('查看详情') }}</a>
                          </a-menu-item>
                          <a-menu-item key="1" :disabled="key.includes(record.mark)">
                            <vco-popconfirm url="/project/project/copyProject" :formParams="{ uuid: record.uuid }" :tip="t('确定要复制{0}', [record.project_name])" :disabled="key.includes(record.mark)" @update="toCopyDetail">
                              <a>{{ t('复制') }}</a>
                            </vco-popconfirm>
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </template>
                </template>
              </a-table>
            </div>
            <div v-if="tableData.length" class="mt-5">
              <a-pagination size="small" :total="pageObj.total" :current="pageObj.currentPage" :page-size="pageObj.pageSize" show-size-changer show-quick-jumper :show-total="(total) => t('共{0}条', [total])" @change="pageChange" />
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="RequestsLoanList">
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import { hasPermission } from '@/directives/permission/index';
import { useTableList } from '@/hooks/useTableList';
import TableSearch from './components/TableSearch.vue';
import GridBlock from './components/GridBlock.vue';
import { navigationTo } from '@/utils/tool';
import { projectListApi, associateSystemConfig } from '@/api/process';
import tool from '@/utils/tool';
import { processRoutes } from '@/constant';
import emitter from '@/event';
import BindUsersDialog from '@/views/process/components/BindUsersDialog.vue';
import useUserStore from '@/store/modules/user';
import useProductStore from '@/store/modules/product'

const { t } = useI18n();

const tableSearchRef = ref()

const { currentParams, tableRef, tableLoading, pageObj, tableData, otherInfo, pageChange, getTableData } = useTableList(projectListApi, {}, false);

const userStore = useUserStore();
const isNormalUser = computed(() => userStore.isNormalUser);

const productStore = useProductStore();
const productData = computed(() => productStore.productData)
const openProductData = computed(() => productStore.openProductData)

const currentProduct = ref(productData.value.length ? productData.value[0].uuid : '')

const currentTypeMark = computed(() => {
  const obj = productData.value.find(item => item.uuid === currentProduct.value)
  return obj ? obj.mark : ''
})

const showCreate = computed(() => {
  const obj = productData.value.find(item => item.uuid === currentProduct.value)
  return obj ? Boolean(obj.status) : false
})

const tabLayout = ref(0);
const currentTab = ref('1');
const tabData = ref([
  {
    label: t('申请中'),
    value: '1',
    num: 0
  },
  {
    label: t('已批准'),
    value: '2',
    num: 0
  },
  {
    label: t('已拒绝'),
    value: '3',
    num: 0
  },
  {
    label: t('已取消'),
    value: '4',
    num: 0
  }
]);

const key = ref(['step_borrower_info','step_project_info','step_project_cert','step_loan_info','CANCELED'])
const sortType = ref('desc');
const sortValue = ref('');
const sortTypeData = [
  {
    label: t('默认'),
    value: ''
  },
  {
    label: t('创建时间'),
    value: 'create_time'
  },
  {
    label: t('借款金额'),
    value: 'loan_money'
  }
];

const columns = reactive([
  { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
  { title: t('项目信息'), dataIndex: 'project_info', width: 160, align: 'left' },
  { title: t('借款金额'), dataIndex: 'loan_money', width: 160, align: 'left' },
  { title: t('借款人信息'), dataIndex: 'borrower_info', width: 160, align: 'left' },
  { title: t('客户经理'), dataIndex: 'lm', width: 160, align: 'left' },
  { title: t('期数'), dataIndex: 'term', width: 210, align: 'center' },
  // { title: t('最大费率'), dataIndex: 'lvr', width: 100, align: 'center' },
  { title: t('创建时间'), dataIndex: 'create_time', width: 120, align: 'center' },
  { title: t('状态'), dataIndex: 'status', width: 220, align: 'center' }
  // {
  //   title: t('操作1'),
  //   dataIndex: 'operation',
  //   fixed: 'right',
  //   align: 'center',
  //   width: 50,
  // },
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

const selectedRowKeys = ref([]);
const onSelectChange = (keys) => {
  selectedRowKeys.value = keys;
};

const tabChange = () => {
  if (currentProduct.value) {
    const params = cloneDeep(currentParams.value) || {};
    params.status = '';
    params.sta = currentTab.value;
    params.product_uuid = currentProduct.value
    getTableData(params);
  }
};

const productChange = (data) => {
  currentProduct.value = data.uuid
  currentTab.value = '1'
  tableSearchRef.value.searchHandle(true)
}

const searchHandle = (data = {}) => {
  const params = {
    ...data,
    sta: currentTab.value,
    product_uuid: currentProduct.value
  };
  getTableData(params);
};

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
  userStore.getTaskNumInfo();
  selectedRowKeys.value = [];
  getTableData();
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

watch([sortType, sortValue], ([newSortType, newSortValue]) => {
  const params = cloneDeep(currentParams.value);
  params.order = newSortType;
  params.sort = newSortValue;
  params.page = 1;
  getTableData(params);
});

watch(tableData, () => {
  if (otherInfo.value && otherInfo.value.num) {
    const numInfo = otherInfo.value.num;
    tabData.value.forEach((item) => {
      item.num = numInfo[item.value] || 0;
    });
  }
});

watch(
  () => productData.value,
  (val) => {
    if (val && val.length) {
      currentProduct.value = val[0].uuid
      tabChange()
    }
  }
);

const handleRefreshRequestsList = () => {
  getTableData();
};

const handleRefreshRequestsList2 = () => {
  currentTab.value = '2';
  tabChange();
};

const toCopyDetail = (val) => {
  navigationTo(`/process/four?uuid=${val.uuid}`);
};

const gotoProcess = () => {
  if (openProductData.value.length === 1) {
    navigationTo(`/process/one`)
  } else {
    navigationTo(`/process/one?p=${currentTypeMark.value}`)
  }
  
}

const itemHandle = (data) => {
  const href = processRoutes[data.next_index - 1];
  if (href) {
    navigationTo(`${href}?uuid=${data.uuid}`);
  }
};

onMounted(() => {
  if (hasPermission('projects:copy')) {
    columns.push({
      title: t('操作1'),
      dataIndex: 'operation',
      align: 'center',
      width: 50,
      fixed: 'right'
    });
  }
  tabChange();
  getVcteamData();

  emitter.on('refreshRequestsList', handleRefreshRequestsList);

  emitter.on('refreshRequestsList2', handleRefreshRequestsList2);
});

onUnmounted(() => {
  emitter.off('refreshRequestsList', handleRefreshRequestsList);

  emitter.off('refreshRequestsList2', handleRefreshRequestsList2);
});
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

.user-content {
  .vco-user-item {
    margin-bottom: 8px;
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.page-tab-content {
  border-bottom: 1px solid #808080;
  padding-bottom: 20px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  .nav-content {
    display: flex;
    align-items: center;
    gap: 20px;
    .nav-link {
      display: block;
      background-color: #f3ede5;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 500;
      color: #272727;
      border-radius: 40px;
      transition: all 0.3s ease;
      cursor: pointer;
      &.active {
        background-color: #272727;
        color: #fff;
      }
      &:hover {
        background-color: #272727;
        color: #fff;
      }
    }
  }
  .handle-content {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}
</style>
