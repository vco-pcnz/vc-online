<template>
  <div>
    <a-modal :open="itemVisible" :title="t('进度付款阶段')" :width="500" :footer="null" :keyboard="false" :maskClosable="false" @cancel="setDialogCancel">
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
            <vco-number :value="currentItemInfo.can_amount" color="#ea3535" size="fs_md" :precision="2"></vco-number>
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
      <div class="progress-payment-content" :class="{'preview-table': !isSelect}">
        <div v-if="tableHeader.length && !pageLoading" class="form-block-content" :class="{'mt-10': isSelect}">
          <div v-if="!isSelect && !isBlock" class="title">{{ t('进度付款阶段') }}</div>
          <div v-if="isSelect" class="mt-2 mb-2 flex justify-end gap-4">
            <a-button v-if="selectDataHasNum" type="cyan" class="bold uppercase" @click="selectCancelAll">{{ t('取消所有设置') }}</a-button>
            <a-button type="primary" class="bold uppercase" @click="batchSelectHandle">{{ batchSelect ? t('取消批量模式') : t('批量选择') }}</a-button>
            <a-button v-if="batchSelectData.length" type="grey" class="bold uppercase" @click="batchSelectCancel">{{ t('取消已选择')}}</a-button>
            <a-button v-if="batchSelect" type="dark" :disabled="!batchSelectData.length" class="bold uppercase" @click="batchSelectSet">{{ t('批量设置1') }} ({{ batchSelectData.length }})</a-button>
          </div>
          <p v-if="batchSelect" class="text-right mb-2">{{ t('点击下方表格，选择需要批量操作的数据')}}</p>
          <a-table
            v-if="!easyModel && buildAmount"
            :columns="tableHeader"
            :data-source="tableData"
            bordered
            :pagination="false"
            table-layout="fixed"
            :scroll="{ x: '100%', y: isSelect ? 300 : 600 }"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="record.isFixedRow">
                <template v-if="column.dataIndex === 'type'">
                  <p>{{ record.type }}</p>
                </template>
                <template v-else-if="column.dataIndex === 'payment'">
                  <p>--</p>
                </template>
                <template v-else-if="column.dataIndex === 'total'">
                  <template v-if="showProcess">
                    <div class="select-item disabled">
                      <vco-number :value="advanceAmount" size="fs_md" :precision="2" :end="true"></vco-number>
                      <vco-number :value="tableRemainTotal(advanceAmount, advanceObj?.use_amount || 0)" size="fs_xs" color="#ea3535" :precision="2" :end="true"></vco-number>
                      <vco-number :value="advanceObj?.use_amount || 0" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                      <div class="process-gap"></div>
                      <div class="item-process-content">
                        <a-progress
                          :stroke-color="{
                            '0%': '#64ec22',
                            '100%': '#31bd65'
                          }"
                          :size="6"
                          :percent="advanceObj ? advanceObj.percent : 0"
                        />
                      </div>
                    </div>
                  </template>
                  <vco-number v-else :value="advanceAmount" size="fs_md" :precision="2" :end="true"></vco-number>
                </template>
                <template v-else>
                  <div v-if="showProcess" class="select-item adv" :class="{'hover': isSelect}" @click="itemSetHandle(advanceObj)">
                    <div class="flex justify-center flex-col items-center" :style="{width: tableHeader.length === 4 ? '265px' : '660px'}">
                      <vco-number :value="advanceAmount" size="fs_xs" :precision="2" :end="true"></vco-number>
                      <vco-number :value="tableRemainTotal(advanceAmount, advanceObj?.use_amount || 0)" size="fs_xs" color="#ea3535" :precision="2" :end="true"></vco-number>
                      <vco-number :value="advanceObj?.use_amount || 0" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                      <div class="process-gap"></div>
                      <div class="init-progress">
                        <a-progress
                          :stroke-color="{
                            '0%': '#64ec22',
                            '100%': '#31bd65'
                          }"
                          :size="6"
                          :percent="advanceObj.percent"
                        />
                      </div>
                    </div>
                    <div v-if="advanceObj.checked" class="selected adv">{{ `$${numberStrFormat(advanceObj.set_amount)}` }}</div>
                    <template v-if="advanceObj.selected">
                      <div class="selected-bg"></div>
                      <i class="iconfont selected-icon">&#xe601;</i>
                    </template>
                  </div>

                  <div v-else class="flex justify-center" :style="{width: tableHeader.length === 4 ? '265px' : '660px'}">
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
                  <div class="select-item disabled">
                    <vco-number :value="record.total" size="fs_md" :precision="2" :end="true"></vco-number>
                    <vco-number :value="tableRemainTotal(record.total, record.useTotal)" size="fs_xs" color="#ea3535" :precision="2" :end="true"></vco-number>
                    <vco-number :value="record.useTotal" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                    <div class="process-gap"></div>
                    <div class="item-process-content">
                      <a-progress
                        :stroke-color="{
                          '0%': '#64ec22',
                          '100%': '#31bd65'
                        }"
                        :size="6"
                        :percent="record.percent"
                      />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <template v-if="isSelect"> 
                    <vco-number :value="record[column.dataIndex]" size="fs_md" :precision="2" :end="true"></vco-number>
                  </template>
                  <template v-else>
                    <div class="total-info-txt">Loan<vco-number :value="record[column.dataIndex]" size="fs_xs" :precision="2" :end="true" color="#eb4b6d"></vco-number></div>
                    <div v-if="record.type === tableData[index + 1]?.type" class="total-info-txt">Borrower Equity
                      <vco-number :value="tableData[index + 1][column.dataIndex]" size="fs_xs" :precision="2" :end="true" color="#31bd65"></vco-number>
                    </div>
                    <div class="flex justify-end">
                      <vco-number v-if="record.type === tableData[index + 1]?.type" :value="Number(tool.plus(record[column.dataIndex], tableData[index + 1][column.dataIndex]))" size="fs_md" :precision="2" :end="true"></vco-number>
                      <vco-number v-else :value="record[column.dataIndex]" size="fs_md" :precision="2" :end="true"></vco-number>
                    </div>
                  </template>
                </template>
              </template>
              <template v-else>
                <div v-if="showProcess" class="select-item col" :class="{'hover': isSelect}" @click="itemSetHandle(record[column.dataIndex])">
                  <vco-number :value="record[column.dataIndex].amount" size="fs_xs" :precision="2" :end="true"></vco-number>
                  <vco-number :value="tableRemainTotal(record[column.dataIndex].amount, record[column.dataIndex].use_amount)" size="fs_xs" color="#ea3535" :precision="2" :end="true"></vco-number>
                  <vco-number :value="record[column.dataIndex].use_amount" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                  <div class="process-gap"></div>
                  <div class="item-process-content">
                    <a-progress
                      :stroke-color="{
                        '0%': '#64ec22',
                        '100%': '#31bd65'
                      }"
                      :size="6"
                      :percent="record[column.dataIndex].percent"
                    />
                  </div>
                  <div v-if="record[column.dataIndex].checked" class="selected">{{ `$${numberStrFormat(record[column.dataIndex].set_amount)}` }}</div>
                  <template v-if="record[column.dataIndex].selected">
                    <div class="selected-bg"></div>
                    <i class="iconfont selected-icon">&#xe601;</i>
                  </template>
                </div>
                <vco-number v-else :value="record[column.dataIndex].amount" :class="{'borrowr-amount': record.category === 2}"  :color="isSelect ? '#272727' : '#ea3535'" size="fs_md" :precision="2" :end="true"></vco-number>
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
                        <div class="select-item footer disabled">
                          <vco-number :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                          <vco-number :value="tableRemainTotal(summaryHandle(item.key), tableUseTotal)" size="fs_xs" color="#ea3535" :precision="2" :end="true"></vco-number>
                          <vco-number :value="tableUseTotal" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                          <div class="process-gap"></div>
                          <div class="item-process-content">
                            <a-progress
                              :stroke-color="{
                                '0%': '#64ec22',
                                '100%': '#31bd65'
                              }"
                              :size="6"
                              :percent="getTotalPercent(tableUseTotal, summaryHandle(item.key))"
                            />
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <template v-if="isSelect">
                          <vco-number :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                        </template>
                        <template v-else>
                          <div class="total-info-txt">
                            Loan
                            <vco-number :value="TableLoanTotal(1)" size="fs_xs" :precision="2" :end="true" color="#eb4b6d"></vco-number>
                          </div>
                          <div class="total-info-txt">
                            Borrower Equity
                            <vco-number :value="TableLoanTotal(2)" size="fs_xs" :precision="2" :end="true" color="#31bd65"></vco-number>
                          </div>
                          <div class="flex justify-end">
                            <vco-number
                              :value="summaryHandle(item.key)"
                              size="fs_md"
                              :precision="2"
                              :end="true"
                            ></vco-number>
                          </div>
                        </template>
                      </template>
                    </template>
                    <template v-else>
                      <template v-if="showProcess">
                        <div class="select-item footer disabled">
                          <vco-number :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                          <vco-number :value="tableRemainTotal(summaryHandle(item.key), summaryHandle(item.key, 'use_amount'))" size="fs_xs" color="#ea3535" :precision="2" :end="true"></vco-number>
                          <vco-number :value="summaryHandle(item.key, 'use_amount')" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                          <div class="process-gap"></div>
                          <div class="item-process-content">
                            <a-progress
                              :stroke-color="{
                                '0%': '#64ec22',
                                '100%': '#31bd65'
                              }"
                              :size="6"
                              :percent="getTotalPercent(summaryHandle(item.key, 'use_amount'), summaryHandle(item.key))"
                            />
                          </div>
                        </div>
                        
                      </template>
                      <vco-number v-else :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                    </template>
                  </a-table-summary-cell>
                </a-table-summary-row>
              </a-table-summary>
            </template>
          </a-table>
          <div v-if="footerDataCol.length" class="other-table-info" :class="{'page': isPage, 'easy-model': easyModel || !buildAmount}">
            <div
              v-for="item in footerDataCol" :key="item.type"
              class="item"
              :class="{'hover': isSelect}"
              @click="itemSetHandle(item)"
            >
              <template v-if="!isSelect">
                <vco-number :value="item.amount" size="fs_md" color="#ea3535" :precision="2" :end="true"></vco-number>
                <vco-number :value="item.borrower_equity" size="fs_md" color="#31bd65" :precision="2" :end="true" class="mt-1"></vco-number>
              </template>
              <vco-number v-else :value="item.amount" size="fs_md" :precision="2" :end="true"></vco-number>
              <vco-number v-if="showProcess" :value="tableRemainTotal(item.amount, item.use_amount)" size="fs_xs" color="#ea3535" :precision="2" :end="true"></vco-number>
              <vco-number v-if="showProcess" :value="item.use_amount" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
              <a-progress
                v-if="showProcess"
                :stroke-color="{
                  '0%': '#64ec22',
                  '100%': '#31bd65'
                }"
                :size="6"
                :percent="item.percent"
              />
              <p :class="{'mt-2': !showProcess}">{{ item.name }}</p>
              <div v-if="item.checked" class="selected">{{ `$${numberStrFormat(item.set_amount)}` }}</div>
              <template v-if="item.selected">
                <div class="selected-bg"></div>
                <i class="iconfont selected-icon">&#xe601;</i>
              </template>
            </div>
          </div>
          <div class="table-total-content">
            <p>Total Cost to Complete</p>
            <div class="total-item">
              <div v-if="!isSelect" class="total-item flex justify-end items-center gap-2">
                <vco-number :value="loanTotal" size="fs_md" :precision="2" :end="true" color="#eb4b6d"></vco-number>
                <span>{{ Number(borrowerEquityTotal) < 0 ? '-' : '+' }}</span>
                <vco-number :value="Math.abs(borrowerEquityTotal)" size="fs_md" :precision="2" :end="true" color="#31bd65"></vco-number>
                <span>=</span>
                <vco-number :value="tableTotal" size="fs_xl" :precision="2" :end="true" :bold="true"></vco-number>
              </div>
              <vco-number v-else :value="tableTotal" :bold="true" size="fs_xl" :precision="2" :end="true"></vco-number>
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
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from "vue"
  import { useI18n } from "vue-i18n";
  import { useRoute } from "vue-router"
  import { toolsDetail, toolsGetBuild } from '@/api/import'
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
    isBlock: {
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
    },
    projectDetail: {
      type: Object,
      default: () => {}
    },
    isPage: {
      type: Boolean,
      default: false
    }
  })

  const emits = defineEmits(['selectDone'])

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
    const numArr = isNaN(Number(arr[0])) ? arr.filter(item => item.id).map(item => Number(item[`${keyStr}`])) : arr.map(item => Number(item))
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
    if (Number(amount)) {
      const num = Number(Number(tool.div(Number(useAmount), Number(amount))).toFixed(2))
      return Number(tool.times(num, 100))
    } else {
      return 0
    }
  }

  const loanTotal = computed(() => {
    const inputArr = footerDataCol.value.map(item => Number(item.loan))
    const inputNum = inputArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);

    const tableNum = easyModel.value ? 0 : TableLoanTotal.value(1)

    return tool.plus(tableNum, inputNum)
  })

  const borrowerEquityTotal = computed(() => {
    const inputArr = footerDataCol.value.map(item => Number(item.borrower_equity))
    const inputNum = inputArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);

    const tableNum = easyModel.value ? 0 : TableLoanTotal.value(2)

    return tool.plus(tableNum, inputNum)
  })


  const tableTotal = computed(() => {
    const tableNum = easyModel.value ? 0 : summaryHandle('total')

    const key = props.isSelect ? 'loan' : 'total'
    const inputArr = footerDataCol.value.map(item => item[key])
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
    const totalAll = tool.plus(Number(total), advanceObj.value.use_amount)
    return totalAll
  })

  const TableLoanTotal = computed(() => {
    return (type) => {
      const arr = tableData.value.filter(item => !item.isFixedRow && item.category === type).map(item => item.total)
      const total = arr.reduce((total, num) => {
        return Number(tool.plus(total, num))
      }, 0);
      return type === 1 ? Number(tool.plus(total, advanceAmount.value)) : total
    }
  })

  const selectDataHasNum = computed(() => {
    return selectData.value.filter(item => Number(item.set_amount)).length
  })

  const tableRemainTotal = (total, useTotal) => {
    return tool.minus(total, useTotal)
  }

  const setTableData = (headerData) => {
    const payment = cloneDeep(setedData.value.payment)
    const column = cloneDeep(setedData.value.column)

    for (const key in payment) {
      if (key === '0$1__payment') {
        delete payment[key]
      }

      if (props.isSelect) {
        if (key.indexOf('$2') > -1) {
          delete payment[key]
        }
      }
    }

    const data = []
    for (const key in payment) {
      data.push({
        ...payment[key]
      })
    }

    const hadSetData = cloneDeep(setedData.value.data)

    const dataArr = Number(advanceAmount.value) ? [{
        isFixedRow: true,
        type: advanceKey.value
      }
    ] : []
    for (let i = 0; i < data.length; i++) {
      const obj = {
        type: data[i].type_name,
        typeId: data[i].type,
        payment: payment[`${data[i].type}$${data[i].category}__payment`] ? payment[`${data[i].type}$${data[i].category}__payment`].amount : 0,
        category: data[i].category
      }
      for (let j = 0; j < headerData.length; j++) {
        const amountItem = hadSetData[`${data[i].type}$${data[i].category}__${headerData[j].dataIndex}`] || {}
        if (Object.keys(amountItem).length) {
          amountItem.amount = Number(amountItem.amount)
          amountItem.checked = false
          amountItem.selected = false
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
      const num = Number(total) ? Number(Number(tool.div(Number(useTotal), Number(total))).toFixed(2)) : 0
      obj.percent = Number(tool.times(num, 100))

      
      if (!props.isSelect) {
        dataArr.push(obj)
      } else {
        if (Number(obj.payment)) {
          dataArr.push(obj)
        }
      }
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
          width: 130,
          align: 'center'
        })
      }
    }

    tableHeader.value = [{
      title: t('类型'),
      dataIndex: "type",
      width: 200,
      align: 'center',
      fixed: 'left'
    }, {
      title: 'Payment',
      dataIndex: "payment",
      width: 90,
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
        if (!props.isSelect) {
          item.customCell = (record, _index) => {
            if (['type', 'total'].includes(item.dataIndex)) {
              // 跳过第一行（isFixedRow）
              if (record.isFixedRow) {
                return {}
              }
              
              // 获取当前行的 type
              const currentType = record.type
              
              // 查找相同 type 的行数
              let rowSpan = 1
              for (let i = _index + 1; i < tableData.value.length; i++) {
                if (tableData.value[i].type === currentType) {
                  rowSpan++
                } else {
                  break
                }
              }
              
              // 如果是第一行相同 type 的行，返回 rowSpan
              if (rowSpan > 1) {
                return { rowSpan }
              }
              
              // 如果是后续相同 type 的行，隐藏单元格
              if (_index > 0 && tableData.value[_index - 1].type === currentType) {
                return { rowSpan: 0 }
              }
              
              return {}
            } else {
              if (record.isFixedRow) {
                const mergeStart = 2
                const mergeEnd = tableHeader.value.length - 2

                if (index === mergeStart) {
                  return {
                    colSpan: mergeEnd - mergeStart + 1
                  }
                } else if (index > mergeStart && index <= mergeEnd) {
                  return {
                    colSpan: 0
                  }
                }
              }
              return {}
            }
          }
        } else {
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
      await toolsGetBuild(params).then(res => {
        const dataRes = res.data || {}
        let data = {}
        if (props.isSelect) {
          for (const key in dataRes) {
            if (key.indexOf('$1') > -1) {
              data[key] = dataRes[key]
            }
          }
        } else {
          data = dataRes
        }
        
        setedData.value = res

        // 首次放款数据
        if (Object.keys(res.payment).length) {
          if (res.payment[`0$1__payment`]) {
            advancePercent.value = res.payment[`0$1__payment`].amount
          }
        }

        // footer 数据
        if (Object.keys(res.summary).length) {
          if (res.summary[`${advanceKey.value}`]) {
            advanceAmount.value = res.summary[`${advanceKey.value}`].amount

            const advanceItem = res.summary[`${advanceKey.value}`]
            advanceItem.amount = Number(advanceItem.amount)
            advanceItem.checked = false
            advanceItem.selected = false
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
            item.selected = false
            item.set_amount = ''
            item.set_amount_per = ''

            const mergItem = {
              loan: item.amount,
              ...summaryItem,
              ...item
            }

            if (Number(mergItem.amount)) {
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
          footerDataCol.value = footerData.filter(item => Number(item.amount))
        }
      })
    } catch (err) {
      pageLoading.value = false
    }

    setTableHeader()
  }

  // 处理footer 数据
  const handleFooterData = (list) => {
    const filterType = easyModel.value ? ['Land', 'Refinance', 'Land_gst'] : ['Land', 'Construction', 'Refinance', 'Land_gst']
    const footerData = list.filter(item => !filterType.includes(item.type)) || []

    // 找到footerData中type为Construction的item, 如果有则把他排到第一位，并且删除原来的Construction
    const conItem = footerData.find(item => item.type === 'Construction')
    if (conItem) {
      footerData.unshift(conItem)
      footerData.splice(footerData.lastIndexOf(conItem), 1)
    }

    const dataArr = []
    for (let i = 0; i < footerData.length; i++) {
      const item = footerData[i]

      // 把大项也添加到数据中，兼容之前已经存在放款的情况
      if (item.loan) {
        dataArr.push(item)
      }

      if (item.list && item.list.length) {
        for (let j = 0; j < item.list.length; j++) {
          const listItem = item.list[j]
          if (listItem.loan) {
            listItem.name = `${item.name} [${listItem.type}]`
            dataArr.push(listItem)
          }
        }
      }
    }

    footerDataCol.value = dataArr
  }

  const buildAmount = ref(0)

  // 是否为简易模式
  const easyModel = ref(true)

  // 请求项目信息
  const getProjectData = async (flag = false) => {
    if (props.projectDetail && Object.keys(props.projectDetail).length && !flag) {
      pageLoading.value = true

      const costModel = Boolean(props.projectDetail.devCostDetail[0].model)
      easyModel.value = costModel
      
      const list = props.projectDetail.devCostDetail[0].data[0].list

      const Construction = list.find(item => item.type === 'Construction')
      buildAmount.value = Construction ? (Number(Construction.loan) || 0) : 0

      handleFooterData(list)
      await getSetedData()
    } else {
      pageLoading.value = true
      const params = {
        uuid: uuid.value
      }

      try {
        await toolsDetail(params).then(res => {
          const costModel = Boolean(res.devCostDetail[0].model)
          easyModel.value = costModel

          const list = res.devCostDetail[0].data[0].list
          const Construction = list.find(item => item.type === 'Construction')
          buildAmount.value = Construction ? (Number(Construction.loan) || 0) : 0
          
          handleFooterData(list)
        })
        
        await getSetedData()
      } catch (err) {
        pageLoading.value = false
      }
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
      const per = Number(currentItemInfo.value.can_amount) ? tool.div(currentItemInfo.value.set_amount, currentItemInfo.value.can_amount) : 0
      currentItemInfo.value.set_amount_per = Number(tool.times(per, 100)).toFixed(2)
    } else {
      if (!isNaN(currentItemInfo.value.set_amount_per)){
        const per = tool.div(currentItemInfo.value.set_amount_per, 100)
        currentItemInfo.value.set_amount = Number(tool.times(per, currentItemInfo.value.can_amount)).toFixed(2)
      }
    }
  }

  const currentSingleItem = ref()
  const itemSetHandle = (data) => {
    if (batchSelect.value) {
      data.selected = !data.selected
      const id = data.id
      const index = batchSelectData.value.findIndex(item => item.id === id)
      if (data.selected) {
        if (index === -1) {
          batchSelectData.value.push(data)
        }
      } else {
        if (index > -1) {
          batchSelectData.value.splice(index, 1)
        }
      }
    } else {
      if (props.isSelect && Number(data.amount)) {
        const num = tool.minus(Number(data.amount), Number(data.use_amount))
        if (data.set_amount && !data.set_amount_per) {
          const per = Number(num) ? tool.div(data.set_amount, num) : 0
          data.set_amount_per = Number(tool.times(per, 100)).toFixed(2)
        }
        data.can_amount = num
        data.can_amount_per = Number(data.amount) ? tool.times(tool.div(Number(num), Number(data.amount)), 100) : 0
        data.showError = false
        currentSingleItem.value = data
        currentItemInfo.value = cloneDeep(data)
        itemVisible.value = true
      }
    }
  }

  const selectSureHandle = () => {
    if (batchSelect.value) {
      if (Number(currentItemInfo.value.set_amount) > Number(currentItemInfo.value.can_amount) || Number(currentItemInfo.value.set_amount) < 0) {
        currentItemInfo.value.showError = true
      } else {
        const setPercent = tool.div(Number(currentItemInfo.value.set_amount_per), 100)
        currentItemInfo.value.showError = false

        batchSelectData.value.forEach(item => {
          const canAmount = Number(tool.minus(Number(item.amount), Number(item.use_amount))).toFixed(2)
          const setAmount = Number(tool.times(Number(canAmount), Number(setPercent))).toFixed(2)

          item.set_amount = setAmount
          item.checked = Boolean(Number(setAmount))
          item.selected = false

          const obj = selectData.value.find(_item => _item.id === item.id)
          if (obj) {
            obj.set_amount = item.set_amount
            obj.set_amount_per = ''
          } else {
            selectData.value.push(item)
          }
        })
        itemVisible.value = false
        batchSelect.value = false
        batchSelectData.value = []
      }
    } else {
      if (Number(currentItemInfo.value.set_amount) > Number(currentItemInfo.value.can_amount) || Number(currentItemInfo.value.set_amount) < 0) {
        currentItemInfo.value.showError = true
      } else {
        currentItemInfo.value.checked = Boolean(Number(currentItemInfo.value.set_amount))
        const data = cloneDeep(currentItemInfo.value)
        if (selectIdData.value.includes(data.id)) {
          const obj = selectData.value.find(item => item.id === data.id)
          if (obj) {
            obj.set_amount = data.set_amount
          }
        } else {
          selectData.value.push(data)
        }

        itemVisible.value = false
        currentItemInfo.value.showError = false
        const { checked, set_amount, set_amount_per } = currentItemInfo.value
        
        currentSingleItem.value.checked = checked
        currentSingleItem.value.set_amount = set_amount
        currentSingleItem.value.set_amount_per = set_amount_per

        currentItemInfo.value = {}
        currentSingleItem.value = {}
      }
    }

    // 删除没有设置金额的数据
    selectData.value = selectData.value.filter(item => Number(item.set_amount))
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

  const batchSelect = ref(false)
  const batchSelectData = ref([])

  const batchSelectHandle = () => {
    batchSelect.value = !batchSelect.value
    if (!batchSelect.value) {
      batchSelectData.value.forEach(item => {
        item.selected = false
      })
      batchSelectData.value = []
    }
  }

  const batchSelectCancel = () => {
    batchSelectData.value.forEach(item => {
      item.selected = false
    })
    batchSelectData.value = []
  }

  const batchSelectSet = () => {
    const amountArr = batchSelectData.value.map(item => Number(item.amount || 0))
    const totalAmount = amountArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);

    const useAmountArr = batchSelectData.value.map(item => Number(item.use_amount || 0))
    const useTotalAmount = useAmountArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);

    const setAmountArr = batchSelectData.value.map(item => Number(item.set_amount || 0))
    const setTotalAmount = setAmountArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);

    const num = tool.minus(totalAmount, useTotalAmount)

    const data = {
      amount: totalAmount,
      use_amount: useTotalAmount,
      can_amount: num,
      set_amount: setTotalAmount,
      set_amount_per: Number(tool.times(tool.div(setTotalAmount, num), 100)).toFixed(2),
      can_amount_per: Number(tool.times(tool.div(Number(num), Number(totalAmount)), 100)).toFixed(2),
      showError: false
    }

    currentItemInfo.value = data
    itemVisible.value = true
  }

  const setDialogCancel = () => {
    itemVisible.value = false
    currentItemInfo.value = {}
    currentSingleItem.value = {}
  }

  const selectCancelAll = () => {
    for (let i = 0; i < tableData.value.length; i++) {
      for (const key in tableData.value[i]) {
        if (key.indexOf('-') > -1) {
          tableData.value[i][key].set_amount = ''
          tableData.value[i][key].checked = false
        }
      }
    }

    for (let i = 0; i < footerDataCol.value.length; i++) {
      footerDataCol.value[i].set_amount = ''
      footerDataCol.value[i].checked = false
    }
    selectData.value = []
  }

  onMounted(async () => {
    const { query } = route
    uuid.value = query.uuid

    if (uuid.value) {
      await getProjectData()
    }
  })

  defineExpose({
    getProjectData
  })
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';

  .progress-payment-content {
    min-height: 300px;
    &.stat {
      min-height: auto;
      margin-bottom: 20px;
    }
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

    :deep(.ant-statistic) {
      line-height: 1.2;
    }

    :deep(.ant-table-wrapper) {
      .ant-table-cell-fix-right-first::after,
      * {
        border-color: #272727 !important;
      }
      .ant-table-tbody>tr>td {
        padding-left: 10px;
        padding-right: 10px;
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
    flex-wrap: wrap;
    height: 130px;
    overflow-y: scroll;
    &.page {
      overflow: hidden;
      height: auto;
    }
    &.easy-model {
      border-top: 1px solid #272727;
      overflow: hidden;
      height: auto;
      margin-top: 10px;
    }
    > .item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      border-right: 1px solid #ddd;
      border-top: 1px solid #ddd;
      padding: 10px 15px;
      position: relative;
      overflow: hidden;
      min-width: 220px;
      &:nth-child(-n+5) {
        border-top: none;
      }
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

      .selected-bg {
        position: absolute;
        background-color: rgba(49, 189, 101, 1);
        width: 40px;
        height: 40px;
        right: -20px;
        bottom: -20px;
        transform: rotate(-45deg);
        z-index: 1;
      }

      .selected-icon {
        position: absolute;
        right: 2px;
        bottom: 2px;
        color: #fff;
        font-size: 11px;
        z-index: 2;
      }

      .ant-progress-line {
        margin: -5px;
      }

      :deep(.ant-progress-text) {
        font-size: 11px !important;
      }
    }
  }

  .process-gap {
    height: 10px;
  }
  .init-progress {
    width: 160px;
    position: absolute;
    bottom: 5px;
    :deep(.ant-progress-line) {
      margin: 0 !important;
    }
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
    margin: -16px -10px;
    padding: 16px 10px;
    &.footer {
      margin: -16px -5px;
    }
    &.hover {
      cursor: pointer;
      transition: all 0.2s ease;
      &:hover {
        background-color: rgba(241, 153, 21, .2)
      }
    }
    &.adv {
      .selected-bg {
        left: -20px;
        bottom: -20px;
      }
      .selected-icon {
        left: 2px;
        bottom: 2px;
      }
    }
    &.col {
      .selected-bg {
        right: -20px;
        bottom: -20px;
      }
      .selected-icon {
        right: 2px;
        bottom: 2px;
      }
    }
    > .selected {
      position: absolute;
      background-color: rgba(49, 189, 101, 0.8);
      top: 0;
      left: 0;
      font-size: 11px;
      padding: 0 5px;
    }
    .selected-bg {
      position: absolute;
      background-color: rgba(49, 189, 101, 1);
      width: 40px;
      height: 40px;
      transform: rotate(-45deg);
      z-index: 1;
    }
    .selected-icon {
      position: absolute;
      color: #fff;
      font-size: 11px;
      z-index: 2;
    }
    &.disabled {
      background-color: #f2f2f2;
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

  .total-info-txt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    font-size: 10px;
  }

  .borrowr-amount {
    :deep(.ant-statistic-content) {
      color: rgb(49, 189, 101) !important;
    }
  }

  .preview-table {
    :deep(.ant-table-wrapper) {
      .ant-table-tbody>tr>td {
        padding: 10px;
      }
    }
  }
</style>
