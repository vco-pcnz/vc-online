<template>
  <div>
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
            <a-button type="grey" :disabled="!selectedRowKeys.length" class="uppercase">{{ t('取消项目') }}</a-button>
          </template>
          <template #right>
            <vco-table-layout-type v-model="tabLayout"></vco-table-layout-type>
            <vco-table-sort
              v-model="sortType"
              v-model:value="sortValue"
              :type-data="sortTypeData"
            ></vco-table-sort>
          </template>
        </vco-table-tool>

        <div class="mt-5">
          <a-spin :spinning="tableLoading" size="large">
            <div class="table-content">
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
                    <span v-else>--</span>
                  </template>
                </template>
              </a-table>
            </div>
            <div class="mt-5">
              <a-pagination
                size="small"
                :total="pageObj.total"
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

<script setup>
  import { ref, computed, reactive } from "vue"
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash"
  import { useTableList } from "@/hooks/useTableList"
  import TableSearch from "./components/TableSearch.vue";
  import GridBlock from "./components/GridBlock.vue";
  import { navigationTo } from "@/utils/tool";
  import { projectListApi } from "@/api/process";

  const { t } = useI18n();

  const {
    tableRef,
    tableLoading,
    pageObj,
    tableData,
    pageChange,
    getTableData,
    searchReset
  } = useTableList(projectListApi)

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
      value: 'time',
    },
    {
      label: t("ID"),
      value: 'id',
    },
    {
      label: t("借款金额"),
      value: 'amount',
    }
  ]

  const columns = reactive([
    { title: t('项目图片'), dataIndex: 'project_image', width: 100, align: 'center' },
    { title: t('项目信息'), dataIndex: 'project_info', width: 250, align: 'left' },
    { title: t('借款金额'), dataIndex: 'loan_money', width: 250, align: 'left' },
    { title: t('借款人信息'), dataIndex: 'borrower_info', width: 150, align: 'center' },
    { title: t('客户经理'), dataIndex: 'lm', width: 230, align: 'center' },
    { title: t('期数'), dataIndex: 'term', width: 180, align: 'left' },
    { title: t('最大费率'), dataIndex: 'LVR', width: 150, align: 'center' },
    { title: t('创建时间'), dataIndex: 'create_time', width: 150, align: 'center' },
    { title: t('状态'), dataIndex: 'status', width: 150, align: 'center' },
    {
      title: t('操作1'),
      key: 'operation',
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
    console.log(currentTab.value)
  }

  const searchHandle = (data) => {
    console.log('search', data)
  }

  const currentCheckAll = ref(false)
  const checkHandle = (flag) => {
    currentCheckAll.value = flag
    tableData.value.forEach(item => item.checked = flag)
  }
</script>

<style lang="less" scoped>
  .table-content {
    width: 100%;
    min-height: 300px;
  }
</style>