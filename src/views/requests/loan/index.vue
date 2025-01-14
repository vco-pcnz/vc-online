<template>
  <div>
    <bind-users-dialog
      v-model:visible="showDialog"
      :type="1"
      :p-ids="pIds"
      :data="vcTeamObj"
      :vc-team="vcTeamData"
      @done="bindDone"
    ></bind-users-dialog>

    <vco-page-nav sup-path="/requests">
      <template #action>
        <a-button type="cyan" shape="round" @click="navigationTo('/process/one')">{{ t('发起借款申请') }}</a-button>
      </template>
    </vco-page-nav>

    <div class="mt-5">
      <vco-page-tab :tabData="tabData" v-model:current="currentTab" @change="tabChange"></vco-page-tab>
      <table-search @search="searchHandle"></table-search>
      <div class="mt-10">
        <vco-table-tool>
          <template #left>
            <a-button type="grey"
              v-permission="'requests:loan:allocateLm'"
              :disabled="!selectedRowKeys.length"
              class="uppercase"
              @click="bindHandle(false)"
            >{{ t('分配LM') }}</a-button>
          </template>
          <template #right>
            <!-- <vco-table-layout-type v-model="tabLayout"></vco-table-layout-type> -->
            <vco-table-sort
              v-model="sortType"
              v-model:value="sortValue"
              :type-data="sortTypeData"
            ></vco-table-sort>
          </template>
        </vco-table-tool>

        <div class="mt-5">
          <a-spin :spinning="tableLoading" size="large">
            <div class="table-content sys-table-content">
              <!-- :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" -->
              <grid-block v-if="tabLayout"></grid-block>
              <a-table
                v-else
                ref="tableRef"
                rowKey="uuid"
                :columns="columns"
                :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                :data-source="tableDataRef"
                :pagination="false"
                :scroll="{ x: '100%' }"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'project_image'">
                    <template v-if="record.imgsArr.length">
                      <div class="flex justify-center cursor-pointer">
                        <vco-avatar
                          :src="record.imgsArr[0]"
                          :radius="true"
                          :round="false"
                          @click="showPreviewHandle(record)"
                        ></vco-avatar>
                      </div>
                      
                      <div style="display: none">
                        <a-image-preview-group :preview="{ visible: record.showPreview, onVisibleChange: vis => (record.showPreview = vis) }">
                          <a-image
                            v-for="item in record.imgsArr"
                            :key="item"
                            :src="item"
                          />
                        </a-image-preview-group>
                      </div>
                    </template>
                    <p v-else>--</p>
                  </template>
                  <template v-if="column.dataIndex === 'project_info'">
                    <span>ID: {{ record.project_apply_sn }}</span>
                    <div :title="record.project_name" class="mt-1.5 truncate">{{ record.project_name || t('项目名称') }}</div>
                    <div v-if="record.showAddress && record.showAddress.length > 3" class="icon-txt mt-1">
                      <i class="iconfont cer">&#xe814;</i>
                      <span :title="record.showAddress" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-2">{{ record.showAddress }}</span>
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'loan_money'">
                    <vco-number v-if="record.loan_money" :value="record.loan_money" :precision="2"></vco-number>
                    <p v-else>--</p>
                  </template>
                  <template v-if="column.dataIndex === 'borrower_info'">
                    <div class="icon-txt">
                      <i class="iconfont cer">{{ record.borrower_type === 1 ? '&#xe632;' : '&#xe683;'}}</i>
                      <span class="cer text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record.showName || '--' }}</span>
                    </div>
                    <div class="icon-txt mt-1.5">
                      <i class="iconfont" :class="{'cer': record.borrower_ver}">&#xe66f;</i>
                      <span :class="{'cer': record.borrower_ver}" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record.borrower_email || '--' }}</span>
                    </div>
                    <div class="icon-txt">
                      <i class="iconfont" :class="{'cer': record.borrower_ver}">&#xe678;</i>
                      <span :class="{'cer': record.borrower_ver}" class="text-ellipsis overflow-hidden whitespace-normal line-clamp-1">{{ record.borrower_phone || '--' }}</span>
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'lm'">
                    <div class="user-content" v-if="record.lm_list && record.lm_list.length">
                      <vco-user-item
                        v-for="(item, index) in record.lm_list"
                        :key="index"
                        :data="item"
                      ></vco-user-item>
                    </div>
                    <p v-else>--</p>
                  </template>
                  <template v-if="column.dataIndex === 'term'">
                    <vco-time-line
                      v-if="record.start_date && record.end_date"
                      :open-date="record.start_date"
                      :maturity-date="record.end_date"
                    ></vco-time-line>
                    <p v-else>--</p>
                  </template>
                  <!-- <template v-if="column.dataIndex === 'lvr'">
                    <span v-if="record.lvr">{{ record.lvr }}</span>
                    <p v-else>--</p>
                  </template> -->
                  <template v-if="column.dataIndex === 'create_time'">
                    <span v-if="record.create_time">{{ tool.showDate(record.create_time) }}</span>
                    <p v-else>--</p>
                  </template>
                  <template v-if="column.dataIndex === 'status'">

                    <template v-if="record.lm_list && record.lm_list.length || !record.allocation">
                      <a-button
                        v-if="record.has_permission"
                        type="primary"
                        shape="round"
                        @click="itemHandle(record)"
                      >{{ t(record.status_name) }}</a-button>
                      <p v-else>{{ t(record.status_name) }}</p>
                    </template>
                    <template v-else>
                      <a-button
                        v-if="hasPermission('requests:loan:allocateLm')"
                        type="primary"
                        shape="round"
                        @click="bindHandle(record)"
                      >{{ t('分配LM') }}</a-button>
                      <p v-else>{{ t('等待分配LM') }}</p>
                    </template>
                  </template>
                  <template v-if="column.dataIndex === 'operation'">
                    <a-dropdown :trigger="['click']">
                      <a class="ant-dropdown-link" @click.prevent>
                        <i class="iconfont">&#xe77a;</i>
                      </a>
                      <template #overlay>
                        <a-menu>
                          <a-menu-item key="0">
                            <a @click="navigationTo(`/requests/details?uuid=${record.uuid}`)">{{ t('查看详情') }}</a>
                          </a-menu-item>
                        </a-menu>
                      </template>
                    </a-dropdown>
                  </template>
                </template>
              </a-table>
            </div>
            <div class="mt-5">
              <a-pagination
                size="small"
                :total="pageObj.total"
                :current="pageObj.currentPage"
                :page-size="pageObj.pageSize"
                show-size-changer
                show-quick-jumper
                :show-total="total => t('共{0}条', [total])"
                @change="pageChange"
              />
            </div>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup name="RequestsLoanList">
  import { ref, computed, reactive, onMounted, watch } from "vue"
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  import { hasPermission } from "@/directives/permission/index"
  import { useTableList } from "@/hooks/useTableList"
  import TableSearch from "./components/TableSearch.vue";
  import GridBlock from "./components/GridBlock.vue";
  import { navigationTo } from "@/utils/tool";
  import { projectListApi, associateSystemConfig } from "@/api/process";
  import tool from "@/utils/tool";
  import { processRoutes } from "@/constant"
  import emitter from "@/event"
  import BindUsersDialog from "@/views/process/components/BindUsersDialog.vue";

  const { t, locale } = useI18n();

  const {
    currentParams,
    tableRef,
    tableLoading,
    pageObj,
    tableData,
    pageChange,
    getTableData
  } = useTableList(projectListApi, {}, false)

  const tabLayout = ref(0)
  const currentTab = ref('1')
  const tabData = ref([
    {
      label: t("申请中"),
      value: '1',
      num: 0
    },
    {
      label: t("已批准"),
      value: '2',
      num: 0
    },
    {
      label: t("已拒绝"),
      value: '3',
      num: 0
    }
  ])

  const sortType = ref('desc')
  const sortValue = ref('')
  const sortTypeData = [
    {
      label: t("默认"),
      value: '',
    },
    {
      label: t("创建时间"),
      value: 'create_time',
    },
    {
      label: t("借款金额"),
      value: 'loan_money',
    }
  ]

  const columns = reactive([
    { title: t('项目图片'), dataIndex: 'project_image', width: 80, align: 'center' },
    { title: t('项目信息'), dataIndex: 'project_info', width: 180, align: 'left' },
    { title: t('借款金额'), dataIndex: 'loan_money', width: 160, align: 'left' },
    { title: t('借款人信息'), dataIndex: 'borrower_info', width: 180, align: 'left' },
    { title: t('客户经理'), dataIndex: 'lm', width: 180, align: 'left' },
    { title: t('期数'), dataIndex: 'term', width: 220, align: 'center' },
    // { title: t('最大费率'), dataIndex: 'lvr', width: 100, align: 'center' },
    { title: t('创建时间'), dataIndex: 'create_time', width: 120, align: 'center' },
    { title: t('状态'), dataIndex: 'status', width: 240, align: 'center' },
    {
      title: t('操作1'),
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 50
    }
  ]);

  const tableDataRef = computed(() => {
    const data = tableData.value
    data.forEach(item => {
      const images = item.project_image || ''
      let imgsArr = []
      if (images) {
        imgsArr = images.split(',')
      }

      if (locale.value === 'en') {
        item.showAddress = `${item.project_address} ${item.region_three_name} ${item.region_two_name} ${item.region_one_name}`
      } else {
        item.showAddress = `${item.region_one_name} ${item.region_two_name} ${item.region_three_name} ${item.project_address}`
      }

      if (item.borrower_type === 1) {
        item.showName = `${item.first_name} ${item.middle_name} ${item.last_name}`
      } else {
        item.showName = item.organization_name
      }

      item.imgsArr = imgsArr
      item.showPreview = false
    })
    return data
  })

  const showPreviewHandle = (data) => {
    data.showPreview = true
  }

  const selectedRowKeys = ref([])
  const onSelectChange = (keys) => {
    selectedRowKeys.value = keys
  }

  const tabChange = () => {
    const params = cloneDeep(currentParams.value) || {}
    params.type = currentTab.value
    getTableData(params)
  }

  const searchHandle = (data = {}) => {
    getTableData(data)
  }

  const vcTeamObj = ref(null)
  const vcTeamData = ref([])
  const showDialog = ref(false)
  const pIds = ref([])

  const bindHandle = (data) => {
    pIds.value = data? data.uuid : selectedRowKeys.value
    vcTeamObj.value['alm'] =   data? data.alm_list : []
    showDialog.value = true
  }

  const bindDone = () => {
    selectedRowKeys.value = []
    getTableData()
  }

  const getVcteamData = () => {
    associateSystemConfig().then(res => {
      vcTeamData.value = res || []
      const vcTeamArr = vcTeamData.value.map(item => item.code)

      const vcObj = {}

      for (let i = 0; i < vcTeamArr.length; i++) {
        vcObj[vcTeamArr[i]] = []
      }

      vcTeamObj.value = vcObj
    })
  }

  const itemHandle = (data) => {
    const href = processRoutes[data.next_index - 1]
    if (href) {
      navigationTo(`${href}?uuid=${data.uuid}`)
    }
  }

  watch([sortType, sortValue], ([newSortType, newSortValue]) => {
    const params = cloneDeep(currentParams.value)
    params.sort_order = newSortType
    params.sort_prop = newSortValue
    params.page = 1
    getTableData(params)
  });

  onMounted(() => {
    tabChange()
    getVcteamData()

    emitter.on('refreshRequestsList', () => {
      getTableData()
    })

    emitter.on('refreshRequestsList2', () => {
      currentTab.value = '2'
      tabChange()
    })
  })
</script>

<style lang="less" scoped>
  @import "@/styles/variables.less";

  .table-content {
    width: 100%;
    min-height: 300px;
    :deep(.ant-statistic-content) {
      font-size: 15px !important;
      white-space: nowrap;
    }
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
</style>