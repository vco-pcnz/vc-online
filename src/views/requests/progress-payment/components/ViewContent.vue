<template>
  <div>
    <a-modal :open="itemVisible" :title="t('进度付款阶段')" :width="500" :footer="null" :keyboard="false" :maskClosable="false" @cancel="itemVisible = false">
      <a-row :gutter="24" class="mt-10">
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('总额度') }}</p>
            <vco-number :value="currentItemInfo.amount" size="fs_md" :precision="2"></vco-number>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('已用额度') }}</p>
            <vco-number :value="currentItemInfo.use_amount" size="fs_md" :precision="2"></vco-number>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('可用额度') }}</p>
            <vco-number :value="currentItemInfo.can_amount" color="#31bd65" size="fs_md" :precision="2"></vco-number>
          </div>
        </a-col>
        <a-col :span="16">
          <div class="info-content sys-form-content">
            <p class="name mb-2">{{ t('可用额度') }}</p>
            <a-input-number
              v-model:value="currentItemInfo.set_amount"
              :formatter="value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="value => value.replace(/\$\s?|(,*)/g, '')"
              @input="() => currentItemInput(true)"
            />
            <p v-if="currentItemInfo.showError" class="input-error">{{ t('取值范围: {0} - {1}', ['$0.00', `$${numberStrFormat(currentItemInfo.can_amount)}`]) }}</p>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content sys-form-content">
            <p class="name mb-2">{{ t('可用额度比例') }}</p>
            <a-input v-model:value="currentItemInfo.set_amount_per" suffix="%" @input="() => currentItemInput(false)" />
            <p v-if="currentItemInfo.showError" class="input-error">{{ `0.00% - ${numberStrFormat(currentItemInfo.can_amount_per)}%`}}</p>
          </div>
        </a-col>
      </a-row>
      <div class="mt-5 flex justify-center">
        <a-button type="dark" class="big shadow bold uppercase"
          @click="selectSureHandle"
        >{{ t('确定') }}</a-button>
      </div>
    </a-modal>

    <a-spin :spinning="pageLoading" size="large">
      <div class="progress-payment-content">
        <div v-if="tableHeader.length && hasData && !pageLoading" class="form-block-content" :class="{'mt-10': isSelect}">
          <div v-if="!isSelect" class="title">{{ t('进度付款阶段') }}</div>
          <a-table
            :columns="tableHeader"
            :data-source="tableData"
            bordered
            :pagination="false"
            table-layout="fixed"
            :scroll="{ x: '100%', y: isSelect ? 380 : 450 }"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="record.isFixedRow">
                <template v-if="column.dataIndex === 'type'">
                  <p>{{ record.type }}</p>
                </template>
                <template v-else-if="column.dataIndex === 'payment'">
                  <p>{{ numberStrFormat(advancePercent) }}%</p>
                </template>
                <template v-else-if="column.dataIndex === 'total'">
                  <template v-if="showProcess">
                    <vco-number :value="advanceAmount" size="fs_md" :precision="2" :end="true"></vco-number>
                    <vco-number :value="advanceAmount" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
                    <div class="process-gap"></div>
                    <div class="item-process-content">
                      <a-progress
                        :stroke-color="{
                          '0%': '#F19915',
                          '100%': '#ffb92c',
                        }"
                        :size="6"
                        :percent="advanceObj.percent"
                      />
                    </div>
                  </template>
                  <vco-number v-else :value="advanceAmount" size="fs_md" :precision="2" :end="true"></vco-number>
                </template>
                <template v-else>
                  <div v-if="showProcess" class="select-item" :class="{'hover': isSelect}" @click="itemSetHandle(advanceObj)">
                    <vco-number :value="advanceAmount" size="fs_xs" :precision="2" :end="true"></vco-number>
                    <vco-number :value="advanceAmount" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
                    <div class="process-gap"></div>
                    <div class="item-process-content line">
                      <div class="progress">
                        <a-progress
                          :stroke-color="{
                            '0%': '#F19915',
                            '100%': '#ffb92c',
                          }"
                          :size="6"
                          :percent="advanceObj.percent"
                        />
                      </div>
                    </div>

                    <div v-if="advanceObj.checked" class="selected adv">{{ `$${numberStrFormat(advanceObj.set_amount)}` }}</div>
                  </div>

                  <div v-else class="flex justify-center">
                    <vco-number :value="advanceAmount" size="fs_md" :precision="2" :end="true"></vco-number>
                  </div>
                </template>
              </template>

              <template v-else-if="column.dataIndex === 'type'">
                <p>{{ record[column.dataIndex] }}</p>
              </template>
              <template v-else-if="column.dataIndex === 'payment'">
                <p>{{ numberStrFormat(record[column.dataIndex]) }}%</p>
              </template>
              <template v-else-if="column.dataIndex === 'total'">
                <template v-if="showProcess">
                  <vco-number :value="record.total" size="fs_md" :precision="2" :end="true"></vco-number>
                  <vco-number :value="record.useTotal" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
                  <div class="process-gap"></div>
                  <div class="item-process-content">
                    <a-progress
                      :stroke-color="{
                        '0%': '#F19915',
                        '100%': '#ffb92c',
                      }"
                      :size="6"
                      :percent="record.percent"
                    />
                  </div>
                </template>
                <vco-number v-else :value="record[column.dataIndex]" size="fs_md" :precision="2" :end="true"></vco-number>
              </template>
              <template v-else>
                <div v-if="showProcess" class="select-item" :class="{'hover': isSelect}" @click="itemSetHandle(record[column.dataIndex])">
                  <vco-number :value="record[column.dataIndex].amount" size="fs_xs" :precision="2" :end="true"></vco-number>
                  <vco-number :value="record[column.dataIndex].use_amount" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
                  <div class="process-gap"></div>
                  <div class="item-process-content">
                    <a-progress
                      :stroke-color="{
                        '0%': '#F19915',
                        '100%': '#ffb92c',
                      }"
                      :size="6"
                      :percent="record[column.dataIndex].percent"
                    />
                  </div>
                  <div v-if="record[column.dataIndex].checked" class="selected">{{ `$${numberStrFormat(record[column.dataIndex].set_amount)}` }}</div>
                </div>
                <vco-number v-else :value="record[column.dataIndex].amount" size="fs_md" :precision="2" :end="true"></vco-number>
              </template>
            </template>
            <template #summary>
              <a-table-summary fixed>
                <a-table-summary-row>
                  <a-table-summary-cell v-for="(item, index) in summaryCol" :index="index" :key="item.key" class="text-center">
                    <template v-if="item.key === 'type'">Construction</template>
                    <template v-else-if="item.key === 'payment'">
                      <p class="total-percent">{{ numberStrFormat(summaryHandle(item.key)) }}%</p>
                    </template>
                    <template v-else-if="item.key === 'total'">
                      <template v-if="showProcess">
                        <vco-number :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                        <vco-number :value="tableUseTotal" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
                        <div class="process-gap"></div>
                          <div class="item-process-content">
                            <a-progress
                              :stroke-color="{
                                '0%': '#F19915',
                                '100%': '#ffb92c',
                              }"
                              :size="6"
                              :percent="getTotalPercent(tableUseTotal, summaryHandle(item.key))"
                            />
                          </div>
                      </template>
                      <vco-number v-else :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                    </template>
                    <template v-else>
                      <template v-if="showProcess">
                        <vco-number :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                        <vco-number :value="summaryHandle(item.key, 'use_amount')" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
                        <div class="process-gap"></div>
                        <div class="item-process-content">
                          <a-progress
                            :stroke-color="{
                              '0%': '#F19915',
                              '100%': '#ffb92c',
                            }"
                            :size="6"
                            :percent="getTotalPercent(summaryHandle(item.key, 'use_amount'), summaryHandle(item.key))"
                          />
                        </div>
                      </template>
                      <vco-number v-else :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                    </template>
                  </a-table-summary-cell>
                </a-table-summary-row>
              </a-table-summary>
            </template>
          </a-table>
          <div class="other-table-info">
            <div
              v-for="item in footerDataCol" :key="item.type"
              class="item"
              :class="{'hover': isSelect}"
              @click="itemSetHandle(item)"
            >
              <vco-number :value="item.loan" size="fs_md" :precision="2" :end="true"></vco-number>
              <vco-number v-if="showProcess" :value="item.use_amount" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
              <a-progress
                v-if="showProcess"
                :stroke-color="{
                  '0%': '#F19915',
                  '100%': '#ffb92c',
                }"
                :size="6"
                :percent="item.percent"
              />
              <p :class="{'mt-2': !showProcess}">{{ item.name }}</p>
              <div v-if="item.checked" class="selected">{{ `$${numberStrFormat(item.set_amount)}` }}</div>
            </div>
          </div>
          <div class="table-total-content">
            <p>Total Cost to Complete</p>
            <div class="total-item">
              <vco-number :value="tableTotal" :bold="true" size="fs_xl" :precision="2" :end="true"></vco-number>
            </div>
          </div>

          <div v-if="isSelect" class="mt-10 flex justify-between">
            <div>
              <vco-number :value="selectTotalAmount" :bold="true" size="fs_3xl" :precision="2" :end="true"></vco-number>
              <p style="font-size: 12px; color: #888;">{{ t('已选总额') }}</p>
            </div>
            
            <a-button type="dark" class="big shadow bold uppercase"
              @click="selectConfirm"
            >{{ t('确定') }}</a-button>
          </div>
        </div>
        <a-empty v-if="!hasData && !pageLoading" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from "vue"
  import { useI18n } from "vue-i18n";
  import { useRoute } from "vue-router"
  import { projectAuditStepDetail, projectGetBuild, projectLoanGetBuild, projectDetailApi } from "@/api/process"
  import { cloneDeep } from "lodash"
  import tool, { numberStrFormat } from "@/utils/tool"

  const { t } = useI18n();
  const route = useRoute();

  const props = defineProps({
    showProcess: {
      type: Boolean,
      default: false
    },
    isSelect: {
      type: Boolean,
      default: false
    },
    selectedData: {
      type: Array,
      default: () => []
    },
    buildLogData: { // 历史数据
      type: Array,
      default: () => []
    }
  })

  const emits = defineEmits(['done', 'selectDone'])

  const uuid = ref('')

  const pageLoading = ref(false)

  // 历史数据item的id集合
  const buildLogDataIds = computed(() => {
    const data = props.buildLogData.map(item => item.build_id) || []
    return data
  })

  // 已选择item的id集合
  const selectedDataIds = computed(() => {
    const data = props.selectedData.map(item => item.build_id) || []
    return data
  })

  // 是否为进件阶段
  const isRequests = ref(false)
  const hasData = ref(false)

   // 已设置数据
  const setedData = ref({
    row: {},
    column: {},
    data: {},
    payment: {},
    summary: {}
  })
  /**
   * 表单数据
   */
  const tableHeader = ref([])
  const tableData = ref([])
  const summaryCol = ref([])
  const footerDataCol = ref([])

  const extractAmounts = (obj, keyword, keyValue) => {
    const result = [];

    for (const key in obj) {
      if (key.includes(keyword) && obj[key] && typeof obj[key] === 'object') {
        if (keyValue in obj[key]) {
          result.push(obj[key][`${keyValue}`]);
        }
      }
    }

    return result;
  }

  const summaryHandle = (key, keyValue) => {
    const keyStr = keyValue || 'amount'
    const arr = tableData.value.filter(item => !item.isFixedRow).map(item => item[key])
    const numArr = isNaN(Number(arr[0])) ? arr.map(item => Number(item[`${keyStr}`])) : arr.map(item => Number(item))
    const total = numArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);
    if (key === 'payment') {
      return tool.plus(total, advancePercent.value)
    } else if (key === 'total') {
      return tool.plus(total, advanceAmount.value)
    } else {
      return total
    }
  }

  const getTotalPercent = (useAmount, amount) => {
    const num = Number(Number(tool.div(Number(useAmount), Number(amount))).toFixed(2))
    return Number(tool.times(num, 100))
  }

  const tableTotal = computed(() => {
    const tableNum = summaryHandle('total')
    const inputArr = footerDataCol.value.map(item => item.loan)
    const inputNum = inputArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);
    return tool.plus(tableNum, inputNum)
  })

  const tableUseTotal = computed(() => {
    const arr = tableData.value.filter(item => !item.isFixedRow).map(item => item.useTotal)
    const total = arr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);
    return total
  })


  const setTableData = (headerData) => {
    const payment = cloneDeep(setedData.value.payment)
    const column = cloneDeep(setedData.value.column)

    // 去掉第一行
    const index = column.findIndex(item => item === advanceKey.value)
    if (index > -1) {
      column.splice(index, 1)
    }

    const data = []
    for (const key in column) {
      data.push({
        name: column[key],
        code: Number(key) + 1
      })
    }
    const hadSetData = cloneDeep(setedData.value.data)
    const dataArr = [{
        isFixedRow: true,
        type: advanceKey.value
      }
    ]
    for (let i = 0; i < data.length; i++) {
      const obj = {
        type: data[i].name,
        typeId: data[i].code,
        payment: payment[`${i + 1}__payment`] ? payment[`${i + 1}__payment`].amount : 0
      }
      for (let j = 0; j < headerData.length; j++) {
        const amountItem = hadSetData[`${data[i].code}__${headerData[j].dataIndex}`] || {}
        if (Object.keys(amountItem).length) {
          amountItem.amount = Number(amountItem.amount)
          amountItem.checked = false
          amountItem.set_amount = ''
          amountItem.set_amount_per = ''

          if (amountItem.amount) {
            const use_amount = amountItem.use_amount || 0
            const num = Number(Number(tool.div(Number(use_amount), Number(amountItem.amount))).toFixed(2))
            amountItem.percent = Number(tool.times(num, 100))
          } else {
            amountItem.percent = 0
          }

          // 处理编辑额度
          if (buildLogDataIds.value.includes(amountItem.id)) {
            const logItem = props.buildLogData.find(item => item.build_id === amountItem.id)
            if (logItem) {
              amountItem.use_amount = tool.minus(amountItem.use_amount, logItem.amount)
              if (amountItem.amount) {
                const num = Number(Number(tool.div(Number(amountItem.use_amount), Number(amountItem.amount))).toFixed(2))
                amountItem.percent = Number(tool.times(num, 100))
              } else {
                amountItem.percent = 0
              }
            }
          }
          // 编辑回显数据
          if (selectedDataIds.value.includes(amountItem.id)) {
            const selItem = props.selectedData.find(item => item.build_id === amountItem.id)
            if (selItem) {

              amountItem.checked = true
              amountItem.set_amount = selItem.amount
              selectData.value.push(amountItem)
            }
          }
        }
        obj[headerData[j].dataIndex] = Object.keys(amountItem).length ? amountItem : { amount: 0}
      }
      const amountArr = extractAmounts(obj, '-', 'amount')
      if (amountArr.length && Object.keys(setedData.value.data).length) {
        const sum = amountArr.reduce((total, num) => {
          return Number(tool.plus(total, num))
        }, 0);
        obj.total = sum
      }

      const useAmountArr = extractAmounts(obj, '-', 'use_amount')
      if (useAmountArr.length && Object.keys(setedData.value.data).length) {
        const sum = useAmountArr.reduce((total, num) => {
          return Number(tool.plus(total, num))
        }, 0);
        obj.useTotal = sum
      }

      const total = obj.total || 0
      const useTotal = obj.useTotal || 0
      const num = Number(Number(tool.div(Number(useTotal), Number(total))).toFixed(2))
      obj.percent = Number(tool.times(num, 100))

      dataArr.push(obj)
    }

    tableData.value = dataArr

    pageLoading.value = false

    if (props.selectedData.length) {
      selectSureHandle()
    }
  }

  // 请求已设置数据
  const advanceKey = ref('Initial advance to fund deposit')
  const advanceObj = ref()
  const advancePercent = ref(0)
  const advanceAmount = ref(0)

  const setTableHeader = () => {
    const rowData = setedData.value.row
    const headerData = []
    if (Object.keys(rowData).length) {
      for (const key in rowData) {
        headerData.push({
          title: rowData[key],
          dataIndex: key,
          width: 140,
          align: 'center'
        })
      }
    }

    tableHeader.value = [{
      title: t('类型'),
      dataIndex: "type",
      width: 300,
      align: 'center',
      fixed: 'left'
    }, {
      title: 'Payment',
      dataIndex: "payment",
      width: 150,
      align: 'center',
      fixed: 'left'
    }, ...headerData,
    { title: t('总计'), dataIndex: 'total', width: 180, align: 'center', fixed: 'right' }]

    const summaryColData = []
    for (let i = 0; i < tableHeader.value.length; i++) {
      summaryColData.push({
        key: tableHeader.value[i].dataIndex
      })
    }

    // 合并第一行数据
    if (tableHeader.value.length > 3) {
      tableHeader.value.forEach((item, index) => {
        item.customCell = (record) => {
          if (record.isFixedRow) {
            const mergeStart = 2
            const mergeEnd = tableHeader.value.length - 2

            if (index === mergeStart) {
              // 第一个合并单元格的起始位置
              return {
                colSpan: mergeEnd - mergeStart + 1 // 要合并多少列
              }
            } else if (index > mergeStart && index <= mergeEnd) {
              // 被合并的列
              return {
                colSpan: 0
              }
            }
          }
          return {}
        }
      })
    }

    summaryCol.value = summaryColData
    setTableData(headerData)
  }

  // 请求已设置数据
  const getSetedData = async () => {
    const params = {
      uuid: uuid.value
    }

    try {
      const ajaxFn = isRequests.value ? projectGetBuild : projectLoanGetBuild
      await ajaxFn(params).then(res => {
        const data = res.data || []
        if (Object.keys(data)) {
          setedData.value = res
          hasData.value = true

          // 首次放款数据
          if (Object.keys(res.payment).length) {
            if (res.payment[`0__payment`]) {
              advancePercent.value = res.payment[`0__payment`].amount
            }
          }

          // footer 数据
          if (Object.keys(res.summary).length) {
            if (res.summary[`${advanceKey.value}`]) {
              advanceAmount.value = res.summary[`${advanceKey.value}`].amount

              const advanceItem = res.summary[`${advanceKey.value}`]
              advanceItem.amount = Number(advanceItem.amount)
              advanceItem.checked = false
              advanceItem.set_amount = ''
              advanceItem.set_amount_per = ''
              if (advanceItem.amount) {
                const use_amount = advanceItem.use_amount || 0
                const num = Number(Number(tool.div(Number(use_amount), Number(advanceItem.amount))).toFixed(2))
                advanceItem.percent = Number(tool.times(num, 100))
              } else {
                advanceItem.percent = 0
              }
              
              // 处理编辑额度
              if (buildLogDataIds.value.includes(advanceItem.id)) {
                const logItem = props.buildLogData.find(item => item.build_id === advanceItem.id)
                if (logItem) {
                  advanceItem.use_amount = tool.minus(advanceItem.use_amount, logItem.amount)
                  if (advanceItem.amount) {
                    const num = Number(Number(tool.div(Number(advanceItem.use_amount), Number(advanceItem.amount))).toFixed(2))
                    advanceItem.percent = Number(tool.times(num, 100))
                  } else {
                    advanceItem.percent = 0
                  }
                }
              }

              // 编辑回显数据
              if (selectedDataIds.value.includes(advanceItem.id)) {
                const selItem = props.selectedData.find(item => item.build_id === advanceItem.id)
                if (selItem) {
                  advanceItem.checked = true
                  advanceItem.set_amount = selItem.amount
                  selectData.value.push(advanceItem)
                }
              }

              advanceObj.value = advanceItem
            }

            const footerData = footerDataCol.value.map(item => {
              const summaryItem = res.summary[`${item.name}`] || {}
              item.amount = Object.keys(summaryItem).length ? Number(summaryItem.amount) : 0
              item.checked = false
              item.set_amount = ''
              item.set_amount_per = ''

              const mergItem = {
                loan: item.amount,
                ...item,
                ...summaryItem
              }

              if (mergItem.amount) {
                const use_amount = mergItem.use_amount || 0
                const num = Number(Number(tool.div(Number(use_amount), Number(mergItem.amount))).toFixed(2))
                mergItem.percent = Number(tool.times(num, 100))
              } else {
                mergItem.percent = 0
              }

              // 处理编辑额度
              if (buildLogDataIds.value.includes(mergItem.id)) {
                const logItem = props.buildLogData.find(item => item.build_id === mergItem.id)
                if (logItem) {
                  mergItem.use_amount = tool.minus(mergItem.use_amount, logItem.amount)
                  if (mergItem.amount) {
                    const num = Number(Number(tool.div(Number(mergItem.use_amount), Number(mergItem.amount))).toFixed(2))
                    mergItem.percent = Number(tool.times(num, 100))
                  } else {
                    mergItem.percent = 0
                  }
                }
              }

              // 编辑回显数据
              if (selectedDataIds.value.includes(mergItem.id)) {
                const selItem = props.selectedData.find(item => item.build_id === mergItem.id)
                if (selItem) {
                  mergItem.checked = true
                  mergItem.set_amount = selItem.amount
                  selectData.value.push(mergItem)
                }
              }

              return mergItem
            })
            footerDataCol.value = footerData
          }
        } else {
          pageLoading.value = false
        }
      })
    } catch (err) {
      pageLoading.value = false
    }

    if (hasData.value) {
      setTableHeader()
    }
  }

  // 请求项目信息
  const getProjectData = async () => {
    pageLoading.value = true
    const params = {
      uuid: uuid.value
    }

    try {
      const ajaxFn = isRequests.value ? projectAuditStepDetail : projectDetailApi
      await ajaxFn(params).then(res => {
        emits('done', res)

        const list = res.lending.devCostDetail[0].data[0].list
        const filterType = ['Land', 'Construction', 'Refinance']
        const footerData = list.filter(item => !filterType.includes(item.type))

        footerDataCol.value = footerData || []
      })
      
      await getSetedData()
    } catch (err) {
      pageLoading.value = false
    }
  }

  const selectData = ref([])
  const selectIdData = computed(() => selectData.value.map(item => item.id))
  const selectTotalAmount = computed(() => {
    const data = selectData.value.map(item => item.set_amount)
    const total = data.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);
    return total
  })
  const itemVisible = ref(false)
  const currentItemInfo = ref()

  const currentItemInput = (flag) => {
    if (flag) {
      const per = tool.div(currentItemInfo.value.set_amount, currentItemInfo.value.can_amount)
      currentItemInfo.value.set_amount_per = Number(tool.times(per, 100)).toFixed(2)
    } else {
      if (!isNaN(currentItemInfo.value.set_amount_per)){
        const per = tool.div(currentItemInfo.value.set_amount_per, 100)
        currentItemInfo.value.set_amount = Number(tool.times(per, currentItemInfo.value.can_amount)).toFixed(2)
      }
    }
  }

  const itemSetHandle = (data) => {
    if (props.isSelect && Number(data.amount)) {
      const num = tool.minus(Number(data.amount), Number(data.use_amount))
      if (data.set_amount && !data.set_amount_per) {
        const per = tool.div(data.set_amount, num)
        data.set_amount_per = Number(tool.times(per, 100)).toFixed(2)
      }
      data.can_amount = num
      data.can_amount_per = tool.times(tool.div(Number(num), Number(data.amount)), 100)
      data.showError = false
      currentItemInfo.value = data
      itemVisible.value = true
    }
  }

  const selectSureHandle = () => {
    if (Number(currentItemInfo.value.set_amount) > Number(currentItemInfo.value.can_amount) || Number(currentItemInfo.value.set_amount) < 0) {
      currentItemInfo.value.showError = true
    } else {
      if (Number(currentItemInfo.value.set_amount) === 0) {
        currentItemInfo.value.checked = false
      } else {
        currentItemInfo.value.checked = true
        const data = cloneDeep(currentItemInfo.value)
        if (selectIdData.value.includes(data.id)) {
          const obj = selectData.value.find(item => item.id === data.id)
          if (obj) {
            obj.set_amount = data.set_amount
          }
        } else {
          selectData.value.push(data)
        }
      }
      itemVisible.value = false
      currentItemInfo.value.showError = false
    }
  }

  const selectConfirm = () => {
    const data = selectData.value.map(item => {
      return {
        build_id: item.id,
        amount: item.set_amount
      }
    })
    const selectInfo = {
      build__data: data,
      total: selectTotalAmount.value
    }
    emits('selectDone', selectInfo)
  }

  onMounted(async () => {
    const { path, query } = route

    if (path === '/requests/details/progress-payment') {
      isRequests.value = false
    } else if (path.indexOf('requests') > -1) {
      isRequests.value = true
    }
    uuid.value = query.uuid

    if (uuid.value) {
      await getProjectData()
    }
  })
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';

  .progress-payment-content {
    min-height: 300px;
  }

  .form-block-content {
    margin-bottom: 30px;
    > .title {
      font-weight: 500;
      color: #666;
      margin-bottom: 15px;
      &.flex {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }
    > .content {
      background-color: #fbfbfb;
      border: 1px solid #fbfbfb;
      border-radius: 10px;
      box-shadow: 0 0 8px 0 rgba(0, 0, 0, 0.1);
      padding: 30px;
    }

    :deep(.ant-table-wrapper) {
      .ant-table-cell-fix-right-first::after,
      * {
        border-color: #272727 !important;
      }
      .ant-table-expanded-row-fixed::after {
        border-color: #272727 !important;
      }
      .ant-table-container table>thead>tr:first-child >*:first-child {
        border-start-start-radius: 0 !important;
      }
      .ant-table-ping-right .ant-table-cell-fix-right-first::after {
        box-shadow: inset -15px 0 8px -8px rgba(5, 5, 5, 0.2);
      }
      .ant-table-ping-left .ant-table-cell-fix-left-last::after {
        box-shadow: inset 15px 0 8px -8px rgba(5, 5, 5, 0.2);
      }
      .ant-table-container {
        border-radius: 0 !important;
        .ant-table-header {
          border-radius: 0 !important;
        }
      }
      .ant-table-summary {
        background-color: #f7f9f8 !important;
        .ant-table-cell {
          border-top: 1px solid #272727;
          padding: 16px 5px;
        }
      }
      .ant-table {
        background-color: transparent;
        border-spacing: 10px;
        table {
          border-top: none !important;
          border-radius: 0 !important;
        }
      }
      .ant-table-thead {
        border: none;
        & > tr > th {
          font-weight: 500;
          font-size: 10px;
          color: #282828 !important;
          background-color: #f7f9f8 !important;
          border-top: 1px solid #272727;
          border-radius: 0 !important;
        }
      }
      .ant-empty {
        min-height: 50px !important;
      }

      .type-add {
        padding: 5px;
        border: 1px dashed #F19915 !important;
        cursor: pointer;
        color: #F19915;
        margin-top: 15px;
        &:hover {
          color: #d38106 !important;
          border-color: #d38106 !important;
        }
      }
    }
    :deep(.ant-input-number) {
      .ant-input-number-handler-wrap {
        display: none !important;
      }
    }
  }

  .total-percent {
    &.plus {
      color: #eb4b6d;
    }
    &.minus {
      color: #31bd65;
    }
  }

  .other-table-info {
    border: 1px solid #272727;
    border-top: none;
    background-color: #fff;
    display: flex;
    > .item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-right: 1px solid #ddd;
      padding: 10px 15px;
      position: relative;
      &:last-child {
        border-right: none;
      }
      &.hover {
        cursor: pointer;
        transition: all 0.2s ease;
        &:hover {
          background-color: rgba(241, 153, 21, .2)
        }
      }
      > p {
        font-size: 12px;
        color: #282828;
        word-break: break-all;
        text-align: center;
      }
      .total-item {
        min-width: 150px;
        display: flex;
        align-items: center;
        flex-direction: column;
        justify-content: center;
      }

      .selected {
        position: absolute;
        background-color: rgba(49, 189, 101, 0.8);
        top: 0;
        right: 0;
        font-size: 11px;
        padding: 0 5px;
      }

      .ant-progress-line {
        margin: 0;
      }

      :deep(.ant-progress-text) {
        font-size: 11px !important;
      }
    }
  }

  .process-gap {
    height: 10px;
  }
  .item-process-content {
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    padding: 0 15px;
    &.line {
      display: flex;
      justify-content: center;
      > .progress {
        width: 200px;
      }
    }
    :deep(.ant-progress-text) {
      font-size: 11px !important;
    }
  }

  .select-item {
    position: relative;
    overflow: hidden;
    margin: -16px;
    padding: 16px;
    &.hover {
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover {
        background-color: rgba(241, 153, 21, .2)
      }
    }
    > .selected {
      position: absolute;
      background-color: rgba(49, 189, 101, 0.8);
      top: 0;
      right: 0;
      font-size: 11px;
      padding: 0 5px;
      &.adv {
        right: 50%;
        transform: translateX(50%);
      }
    }
  }

  .info-content {
    margin-bottom: 22px;
    .name {
      font-size: 12px;
      color: #666;
    }
  }

  .input-error {
    width: 100%;
    font-size: 12px;
    color: #eb4b6d;
    text-align: left;
    margin-top: 2px;
  }

  .table-total-content {
    background-color: #f8f8f8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 15px;
    border: 1px solid #272727;
    border-top: none;
    > .total-item {
      min-width: 150px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
