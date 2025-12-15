<template>
  <div>
    <!-- 确认弹窗 -->
    <vco-confirm-alert
      ref="changeAlertRef"
      :confirm-txt="confirmTxt"
      :show-close="changeColseBtn"
      v-model:visible="changeVisible"
      @submit="submitRquest"
    ></vco-confirm-alert>

    <!-- BOC放款比例初始化弹窗 -->
    <a-modal :open="bocInitSplitVisible" :title="t('BOC初始拆分比例')" :width="500" :footer="null" :keyboard="false" :maskClosable="false" @cancel="bocInitSplitCancelHandle">
      <a-row :gutter="24" class="mt-10">
        <a-col :span="12">
          <div class="info-content sys-form-content">
            <p class="name mb-2">Loan</p>
            <a-input v-model:value="bocInitSplitFormstate.loan" suffix="%" />
          </div>
        </a-col>
        <a-col :span="12">
          <div class="info-content sys-form-content">
            <p class="name mb-2">Borrower Equity</p>
            <a-input v-model:value="bocInitSplitFormstate.borrowerEquity" suffix="%" />
          </div>
        </a-col>
      </a-row>
      <div class="mt-5 flex">
        <a-button type="dark" class="big shadow bold uppercase w-full"
          @click="bocInitSplitSureHandle"
        >{{ t('确定') }}</a-button>
      </div>
    </a-modal>

    <a-spin :spinning="pageLoading" size="large">
      <div class="progress-payment-content"> 
        <div v-if="amortizedData.length && !easyModel" class="form-block-content">
          <div class="title">{{ t('最新均摊值') }}</div>
          <a-table
            :columns="amortizedHeader"
            :data-source="amortizedData"
            bordered
            :pagination="false"
            table-layout="fixed"
            :scroll="{ x: '100%' }"
          >
          </a-table>
          <div class="amortized-text" v-html="amortizedCalc"></div>
          <div class="flex justify-end items-center mt-2">
            {{ t('建设金额') }}：
            <vco-number :value="Number(tool.plus(buildAmount, borrowerEquity))" size="fs_xl" :precision="2" :end="true"></vco-number>
          </div>
        </div>

        <div class="form-block-content">
          <div class="flex justify-between mb-2">
            <div class="title">{{ t('进度付款阶段') }}</div>
            <template v-if="!easyModel && calcBuildAmount">
              <div v-if="!isOpen" class="flex gap-5">
                <a-button type="dark" class="uppercase flex items-center" @click="exportHandle">
                  {{ t('下载') }}
                  <a-tooltip>
                    <template #title>
                      <span>{{ t(`下载为Excel表格，编辑后再点击右侧'上传'按钮上传编辑后的数据，以更新设置数据`) }}</span>
                    </template>
                    <QuestionCircleOutlined />
                  </a-tooltip>
                </a-button>
                
                <a-button type="primary" class="uppercase relative">
                  {{ t('上传') }}
                  <input
                    type="file"
                    id="excelFile"
                    class="excel-upload"
                    accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    @change="importHandle"
                  />
                </a-button>

                <a-popconfirm :title="t('确定初始化吗？')" @confirm="initHandle(false)">
                  <a-button
                    type="primary"
                    class="uppercase flex items-center"
                  >
                    {{ t('初始化进度付款') }}
                    <a-tooltip>
                      <template #title>
                        <span>{{ t('操作后数据会按照最新建筑贷款总额和建筑总面积，重新计算进度付款数据') }}</span>
                      </template>
                      <QuestionCircleOutlined />
                    </a-tooltip>
                  </a-button>
                </a-popconfirm>
                <a-button
                  v-if="hasReseted"
                  type="dark"
                  class="uppercase"
                  @click="restoreHandle"
                >
                  {{ t('还原') }}
                </a-button>
              </div>
              <div v-else>
                <a-button
                  type="dark"
                  class="uppercase"
                  @click="restoreHandle"
                >
                  {{ t('刷新') }}
                </a-button>
              </div>
            </template>
          </div>
          <a-table
            v-if="!easyModel && calcBuildAmount"
            :columns="tableHeader"
            :data-source="tableData"
            bordered
            :pagination="false"
            table-layout="fixed"
            :scroll="{ x: '100%', y: 500 }"
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
                  <vco-number :value="advanceAmount" size="fs_md" :precision="2" :end="true"></vco-number>
                </template>
                <template v-else>
                  <div class="flex justify-center flex-col items-center" :style="{width: amLen === 1 ? '340px' : '710px'}">
                    <a-input-number
                      v-model:value="advanceAmount"
                      :min="0"
                      :max="99999999999"
                      :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      style="width: 200px;"
                      @input="() => initHandle(true)"
                      @blur="advanceBlur"
                    />
                    <p v-if="advanceObj?.showError" class="input-error text-center">
                      {{ t('最小值:{0}', [`$${numberStrFormat(advanceObj?.use_amount || 0)}`]) }}
                    </p>
                    <div v-if="isOpen" class="mt-1">
                      <vco-number :value="advanceObj?.use_amount || 0" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                    </div>
                  </div>
                </template>
              </template>

              <template v-else-if="column.dataIndex === 'type'">
                <p>{{ record[column.dataIndex] }}</p>
              </template>
              <template v-else-if="column.dataIndex === 'payment'">
                <p v-if="isOpen">{{ record[column.dataIndex] }}%</p>
                <a-input
                  v-else
                  v-model:value="record[column.dataIndex]"
                  @input="() => initHandle(true)"
                  suffix="%"
                  :class="{'loan-input': Number(record.category) === 1,'borrower-input': Number(record.category) === 2}"
                />
              </template>
              <template v-else-if="column.dataIndex === 'total'">
                <div class="boc-init-split">
                  <div class="top-info">
                    <p>{{ t('BOC初始拆分比例') }}</p>
                    <a-button type="link" @click="bocInitSplitHandle(index)">{{ t('设置') }}</a-button>
                  </div>
                  <div class="bottom-info">
                    <div class="flex justify-between">
                      <vco-number :value="tool.times(Number(record?.['boc-payment-amount']?.per || 0), 100)" prefix="" suffix="%" size="fs_xs" :precision="2" :end="true" :bold="true" color="#eb4b6d"></vco-number>
                      <vco-number :value="tool.times(Number(tableData[index + 1]?.['boc-payment-amount']?.per || 0), 100)" prefix="" suffix="%" size="fs_xs" :precision="2" :end="true" :bold="true" color="#31bd65"></vco-number>
                    </div>
                    <div class="flex justify-between">
                      <p>Loan</p>
                      <p>Borrower Equity</p>
                    </div>
                  </div>
                </div>

                <div class="total-info-txt">Loan<vco-number :value="record[column.dataIndex]" size="fs_xs" :precision="2" :end="true" color="#eb4b6d"></vco-number></div>
                <div v-if="record.type === tableData[index + 1]?.type" class="total-info-txt">Borrower Equity
                  <vco-number :value="tableData[index + 1][column.dataIndex]" size="fs_xs" :precision="2" :end="true" color="#31bd65"></vco-number>
                </div>
                <div class="flex justify-end">
                  <vco-number v-if="record.type === tableData[index + 1]?.type" :value="Number(tool.plus(record[column.dataIndex], tableData[index + 1][column.dataIndex]))" size="fs_md" :precision="2" :end="true"></vco-number>
                  <vco-number v-else :value="record[column.dataIndex]" size="fs_md" :precision="2" :end="true"></vco-number>
                </div>
              </template>
              <template v-else>
                <a-input-number
                  v-model:value="record[column.dataIndex].amount"
                  :min="0"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  :disabled="record[column.dataIndex].disabled"
                  @input="itemInput(record, record[column.dataIndex])"
                  @blur="inputBlur(record, record[column.dataIndex])"
                  :class="{'loan-input': Number(record.category) === 1,'borrower-input': Number(record.category) === 2}"
                />
                <p v-if="record[column.dataIndex].showError" class="input-error">
                  {{ t('最小值:{0}', [`$${numberStrFormat(record[column.dataIndex]?.use_amount || 0)}`]) }}
                </p>
                <div v-if="isOpen" class="mt-1">
                  <vco-number :value="record[column.dataIndex]?.use_amount || 0" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                </div>
              </template>
            </template>
            <template #summary>
              <a-table-summary fixed>
                <a-table-summary-row>
                  <a-table-summary-cell
                    v-for="(item, index) in summaryCol"
                    :index="index"
                    :key="item.key"
                    :class="['text-center', item.key === 'boc-payment-amount' ? 'boc-payment-col' : '']"
                  >
                    <template v-if="item.key === 'type'">Construction</template>
                    <template v-else-if="item.key === 'payment'">
                      <p class="total-percent"
                        :class="{'plus': summaryHandle(item.key) > 100, 'minus': summaryHandle(item.key) < 100}"
                      >{{ numberStrFormat(summaryHandle(item.key)) }}%</p>
                    </template>
                    <template v-else-if="item.key === 'total'">
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
                          :color="totalColor(summaryHandle(item.key))"
                        ></vco-number>
                      </div>
                    </template>
                    <template v-else>
                      <vco-number :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                    </template>
                  </a-table-summary-cell>
                </a-table-summary-row>
              </a-table-summary>
            </template>
          </a-table>
          <div class="other-table-info" :class="{'easy-model': easyModel || !calcBuildAmount}">
            <div v-for="item in footerDataCol" :key="item.type" class="item">
              <div v-if="item.list && item.list.length" class="child-content">
                <div class="child-item" v-for="childItem in item.list" :key="childItem.type">
                  <div class="footer-boc-split has-child">
                    <p>{{ childItem.type }}</p>
                    <div>
                      <a-input-number
                        v-if="bocSplitObjRef[childItem.name]"
                        v-model:value="bocSplitObjRef[childItem.name].amount"
                        :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                        :min="0"
                        :max="Number(childItem.total)"
                        @input="bocItemInput(bocSplitObjRef[childItem.name])"
                        @blur="bocItemInput(bocSplitObjRef[childItem.name])"
                      />
                      <p v-if="bocSplitObjRef[childItem.name]?.showError" class="input-error">
                      {{ t('最小值:{0}', [`$${numberStrFormat(bocSplitObjRef[childItem.name]?.use_amount || 0)}`]) }}
                    </p>
                      <div v-if="isOpen" class="mt-1">
                        <vco-number :value="bocSplitObjRef[childItem.name]?.use_amount || 0" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                      </div>
                    </div>
                  </div>
                  
                  <div class="flex justify-end items-center gap-2 flex-1">
                    <vco-number :value="childItem.loan" size="fs_xs" :precision="2" :end="true" color="#eb4b6d"></vco-number>
                    <span>{{ Number(childItem.borrower_equity) < 0 ? '-' : '+' }}</span>
                    <vco-number :value="Math.abs(childItem.borrower_equity)" size="fs_xs" :precision="2" :end="true" color="#31bd65"></vco-number>
                    <span>=</span>
                    <vco-number :value="childItem.total" size="fs_xs" :precision="2" :end="true"></vco-number>
                  </div>
                </div>
              </div>
              <div class="item-info">
                <div v-if="!item.list || !item.list.length" class="footer-boc-split">
                  <p>{{ item.name }}</p>
                  <div>
                    <a-input-number
                      v-if="bocSplitObjRef[item.name]"
                      v-model:value="bocSplitObjRef[item.name].amount"
                      :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                      :min="0"
                      :max="Number(item.total)"
                      @input="bocItemInput(bocSplitObjRef[item.name])"
                      @blur="bocItemInput(bocSplitObjRef[item.name])"
                    />
                    <p v-if="bocSplitObjRef[item.name]?.showError" class="input-error">
                      {{ t('最小值:{0}', [`$${numberStrFormat(bocSplitObjRef[item.name]?.use_amount || 0)}`]) }}
                    </p>
                    <div v-if="isOpen" class="mt-1">
                      <vco-number :value="bocSplitObjRef[item.name]?.use_amount || 0" size="fs_xs" color="#31bd65" :precision="2" :end="true"></vco-number>
                    </div>
                  </div>
                  
                </div>
                <p v-else>{{ item.name }}</p>
                <div class="total-item flex justify-end items-center gap-2">
                  <vco-number :value="item.loan" size="fs_md" :precision="2" :end="true" color="#eb4b6d"></vco-number>
                  <span>{{ Number(item.borrower_equity) < 0 ? '-' : '+' }}</span>
                  <vco-number :value="Math.abs(item.borrower_equity)" size="fs_md" :precision="2" :end="true" color="#31bd65"></vco-number>
                  <span>=</span>
                  <vco-number :value="item.total" size="fs_md" :precision="2" :end="true" :bold="true"></vco-number>
                </div>
              </div>
            </div>
            <div class="item total">
              <p>Total Cost to Complete</p>
              <div class="total-item flex justify-end items-center gap-2">
                <vco-number :value="loanTotal" size="fs_md" :precision="2" :end="true" color="#eb4b6d"></vco-number>
                <span>{{ Number(borrowerEquityTotal) < 0 ? '-' : '+' }}</span>
                <vco-number :value="Math.abs(borrowerEquityTotal)" size="fs_md" :precision="2" :end="true" color="#31bd65"></vco-number>
                <span>=</span>
                <vco-number :value="tableTotal" size="fs_xl" :precision="2" :end="true" :bold="true"></vco-number>
              </div>
            </div>
          </div>
          <div class="mt-10 flex justify-end gap-10">
            <a-button type="grey" class="big shadow bold uppercase"
              @click="goBack"
            >{{ t('返回') }}</a-button>
            <a-button type="dark" class="big shadow bold uppercase" 
              :loading="subLoading"
              @click="submitHandle"
            >{{ t('提交') }}</a-button>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from "vue"
  import { useI18n } from "vue-i18n";
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { useRoute } from "vue-router"
  import {
    projectAuditStepDetail,
    projectAuditSecurityList,
    projectGetBuild,
    projectLoanGetBuild,
    projectSaveBuild,
    projectLoanSaveBuild,
    projectDetailApi
  } from "@/api/process"
  import { dischargeSecurity } from '@/api/project/loan';
  import { systemDictDataApi } from "@/api/system/index"
  import { cloneDeep } from "lodash"
  import tool, { numberStrFormat, goBack } from "@/utils/tool"
  import { exportTableToExcel } from "@/utils/export-excel"
  import * as XLSX from 'xlsx'
  import { message } from 'ant-design-vue/es';

  const { t } = useI18n();
  const route = useRoute();

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    }
  })
  const emits = defineEmits(['done'])

  const uuid = ref('')

  const pageLoading = ref(false)

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

  const summaryHandle = computed(() => {
    return (key) => {
      const arr = tableData.value.filter(item => !item.isFixedRow).map(item => item[key])
      const numArr = isNaN(Number(arr[0])) ? arr.map(item => Number(item.amount)) : arr.map(item => Number(item))
      const total = numArr.reduce((total, num) => {
        return Number(tool.plus(total, num))
      }, 0);
      if (key === 'payment') {
        return total
        // return tool.plus(total, advancePercent.value)
      } else if (key === 'total') {
        return tool.plus(total, advanceAmount.value)
      } else {
        return total
      }
    }
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

  const totalColor = computed(() => {
    return (num) => {
      if (num > totalLoanAmount.value) {
        return '#eb4b6d'
      } else if (num < totalLoanAmount.value) {
        return '#31bd65'
      } else {
        return '#282828'
      }
    }
  })

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
    const tableNum = easyModel.value ? 0 : summaryHandle.value('total')
    const inputArr = footerDataCol.value.map(item => item.total)
    const inputNum = inputArr.reduce((total, num) => {
      return Number(tool.plus(total, num))
    }, 0);
    return tool.plus(tableNum, inputNum)
  })

  const extractAmounts = (obj, keyword) => {
    const result = [];

    for (const key in obj) {
      if (key.includes(keyword) && obj[key] && typeof obj[key] === 'object') {
        if ('amount' in obj[key]) {
          result.push(obj[key].amount);
        }
      }
    }

    return result;
  }

  const extractArrData = (obj, keyword) => {
    const result = [];

    for (const key in obj) {
      if (key.includes(keyword) && obj[key] && typeof obj[key] === 'object') {
        if ('amount' in obj[key]) {
          result.push(key);
        }
      }
    }

    return result;
  }

  const itemInput = (data, item) => {
    const amountArr = extractAmounts(data, '-')
    if (amountArr.length) {
      const sum = amountArr.reduce((total, num) => {
        return Number(tool.plus(total, num))
      }, 0);
      const payment = tool.div(sum, calcBuildAmount.value)

      data.payment = Number(tool.times(Number(payment), 100)).toFixed(2)
      data.total = sum
    }

    if (props.isOpen) {
      const amount = Number(item.amount)
      const useAmount = Number(item.use_amount)
      if (amount < useAmount) {
        item.showError = true
      }
    }
  }

  const inputBlur = (data, item) => {
    if (props.isOpen) {
      const amount = Number(item.amount)
      const useAmount = Number(item.use_amount)
      if (amount < useAmount) {
        item.amount = useAmount
        item.showError = false

        itemInput(data, item)
      }
    }
  }

  const bocItemInput = (item) => {
    if (props.isOpen) {
      const amount = Number(item.amount)
      const useAmount = Number(item.use_amount)
      if (amount < useAmount) {
        item.showError = true
      }
    }
  }

  const setTableData = (headerData) => {
    const data = cloneDeep(columnsTypeData.value)
    const hadSetData = cloneDeep(setedData.value.data)
    const dataArr = [{
        isFixedRow: true,
        type: 'Initial advance to fund deposit'
      }
    ]
    for (let i = 0; i < data.length; i++) {
      const obj = {
        type: data[i].name,
        typeId: Number(data[i].code.split('$')[0]),
        category: Number(data[i].code.split('$')[1]),
        'boc-payment-amount': bocSplitObjRef.value[`${data[i].code}|${data[i].name}`] || { amount: 0 }
      }
      for (let j = 0; j < headerData.length; j++) {
        const amountItem = hadSetData[`${data[i].code}__${headerData[j].dataIndex}`] || null
        if (amountItem) {
          amountItem.amount = Number(amountItem.amount)
          if (props.isOpen) {
            amountItem.showError = false
            amountItem.disabled = Boolean(securityDataObj.value[`${headerData[j].dataIndex}`].status)
          }
        }
        obj[headerData[j].dataIndex] = amountItem || { amount: 0}
      }

      const amountArr = extractAmounts(obj, '-')
      if (amountArr.length && Object.keys(setedData.value.data).length) {
        const sum = amountArr.reduce((total, num) => {
          return Number(tool.plus(total, num))
        }, 0);
        const payment = tool.div(sum, calcBuildAmount.value)
        obj.payment = Number(tool.times(Number(payment), 100)).toFixed(2)
        obj.total = sum
      } else {
        obj.payment = Number(data[i].note).toFixed(2)
        obj.total = 0
      }

      dataArr.push(obj)
    }
    
    tableData.value = dataArr
  }


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
    const hadUuidData = headerData.map(item => item.dataIndex)

    for (let i = 0; i < securityData.value.length; i++) {
      if (!hadUuidData.includes(securityData.value[i].uuid)) {
        headerData.push({
          title: securityData.value[i].card_no,
          dataIndex: securityData.value[i].uuid,
          width: 150,
          align: 'center'
        })
      }
    }

    tableHeader.value = [{
      title: t('类型'),
      dataIndex: "type",
      width: 190,
      align: 'center',
      fixed: 'left'
    }, {
      title: 'Payment',
      dataIndex: "payment",
      width: 110,
      align: 'center',
      fixed: 'left'
    }, {
      title: t('BOC放款'),
      dataIndex: "boc-payment-amount",
      width: 130,
      align: 'center',
      className: 'boc-payment-col',
      fixed: 'left'
    }, ...headerData,
    { title: t('总计'), dataIndex: 'total', width: 180, align: 'center', fixed: 'right' }]

    // 合并第一行数据
    if (tableHeader.value.length > 3) {
      tableHeader.value.forEach((item, index) => {
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
      })
    }

    const summaryColData = []
    for (let i = 0; i < tableHeader.value.length; i++) {
      summaryColData.push({
        key: tableHeader.value[i].dataIndex
      })
    }

    summaryCol.value = summaryColData
    setTableData(headerData)
  }

  // 建筑放款额
  const buildAmount = ref(0)

  // 建筑贷款自出部分
  const borrowerEquity  = ref(0)

  // 总贷款金额
  const totalLoanAmount = computed(() => {
    return Number(tool.plus(buildAmount.value, borrowerEquity.value))
  })

  // 参与百分比计算金额
  const calcBuildAmount = computed(() => {
    const total = Number(totalLoanAmount.value)
    const initAd = Number(advanceAmount.value)
    const num = tool.minus(total, initAd)
    return Number(num)
  })

  const isRequests = ref(false)

  // 请求抵押物信息
  const securityData = ref([])
  const securityDataObj = ref()
  const securitySqmObj = ref()
  const getSecurityData = async () => {
    const params = {
      uuid: uuid.value,
      type: 2,
      is_calc: 1
    }

    try {
      let dataArr = []
      if (isRequests.value) {
        const { list } = await projectAuditSecurityList(params)
        dataArr = list || []
      } else {
        params.page = 1
        params.limit = 10000
        const { data } = await dischargeSecurity(params)
        dataArr = data || []

        const dataObj = {}
        for (let i = 0; i < dataArr.length; i++) {
          dataObj[`${dataArr[i].uuid}`] = dataArr[i]
        }

        securityDataObj.value = dataObj
      }

      securityData.value = dataArr

      setAmortizedTable()
      setTableHeader()
      pageLoading.value = false

      // 面积比例
      const sqmArr = dataArr.map(item => Number(item.sqm))
      const totalSqm = sqmArr.reduce((total, num) => {
        return Number(tool.plus(total, num))
      }, 0);
      const sqmObjArr = dataArr.map(item => {
        return {
          sqm: Number(item.sqm),
          uuid: item.uuid
        }
      })

      const obj = {}
      for (let i = 0; i < sqmObjArr.length; i++) {
        obj[`${sqmObjArr[i].uuid}`] = sqmObjArr[i].sqm / totalSqm
      }
      securitySqmObj.value = obj
    } catch (err) {
      pageLoading.value = false
    }
  }

  // 最新均摊值数据
  const amortizedHeader = ref([])
  const amortizedData = ref([])
  const amortizedCalc = ref('')

  const setAmortizedData = (data) => {
    const dataArr = []
    const obj = {
      name: 'Size'
    }

    let totalSqm = 0
    for (let i = 0; i < data.length; i++) {
      obj[data[i].uuid] = `${numberStrFormat(data[i].sqm)} m²`
      totalSqm += Number(data[i].sqm)
    }
    obj.total = `${numberStrFormat(totalSqm)} m²`

    dataArr.push(obj)

    const totalNum = Number(tool.plus(buildAmount.value, borrowerEquity.value))
    const calcNum = tool.div(totalNum, totalSqm)
    amortizedCalc.value = `<em>${t('总条数')}：${amLen.value}</em>($${numberStrFormat(buildAmount.value)}<i>[Loan]</i> + $${numberStrFormat(borrowerEquity.value)}<i class="borrower">[Borrower Equity]</i>) ÷ ${obj.total} ≈ <span>$${numberStrFormat(calcNum)}</span>/m²`
    amortizedData.value = dataArr
  }

  const amLen = ref(0)
  const setAmortizedTable = () => {
    const data = cloneDeep(securityData.value)
    const itemData = data.filter(item => item.sqm)
    const headerData = []
    for (let i = 0; i < itemData.length; i++) {
      let title = itemData[i].card_no
      if (props.isOpen && Boolean(itemData[i].status)) {
        title = `${title}(${t('已解押')}）`
      }
      headerData.push({
        title,
        dataIndex: itemData[i].uuid,
        width: 120,
        align: 'center'
      })
    }
    amortizedHeader.value = [{
      title: "",
      dataIndex: "name",
      width: 120,
      align: 'center',
      fixed: 'left'
    }, ...headerData,
    { title: t('总计'), dataIndex: 'total', width: 180, align: 'center', fixed: 'right' }]

    amLen.value = headerData.length
    setAmortizedData(itemData)
  }

  // 请求已设置数据
  const advanceKey = ref('Initial advance to fund deposit')
  const advanceObj = ref()
  const advancePercent = ref(0)
  const advanceAmount = ref(0)

  const getSetedData = async () => {
    advanceAmount.value = 0
    
    const params = {
      uuid: uuid.value
    }

    try {
      const ajaxFn = isRequests.value ? projectGetBuild : projectLoanGetBuild
      await ajaxFn(params).then(res => {
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

            advanceObj.value = res.summary[`${advanceKey.value}`]
            advanceObj.value.showError = false
          }
        }
      })

      columnsType()

      await getSecurityData()
    } catch (err) {
      pageLoading.value = false
    }
  }

  // 是否为简易模式
  const easyModel = ref(true)

  // 请求项目信息
  const projectDetail = ref()
  const getProjectData = async () => {
    pageLoading.value = true

    const params = {
      uuid: uuid.value
    }

    try {
      const ajaxFn = isRequests.value ? projectAuditStepDetail : projectDetailApi
      await ajaxFn(params).then(res => {
        projectDetail.value = res

        emits('done', res)
        const costModel = Boolean(res.lending.devCostDetail[0].model)
        easyModel.value = costModel
        const list = res.lending.devCostDetail[0].data[0].list
        const filterType = costModel ? ['Land', 'Refinance', 'Land_gst'] : ['Land', 'Construction', 'Refinance', 'Land_gst']
        const footerData = list.filter(item => !filterType.includes(item.type))

        // 找到footerData中type为Construction的item, 如果有则把他排到第一位，并且删除原来的Construction
        const conItem = footerData.find(item => item.type === 'Construction')
        if (conItem) {
          footerData.unshift(conItem)
          footerData.splice(footerData.lastIndexOf(conItem), 1)
        }

        footerData.forEach(item => {
          item.showError = false
          item.use_amount = Number(item.use_amount || 0)
          if (item.list && item.list.length) {
            item.list.forEach(listItem => {
              listItem.showError = false
              listItem.name = `${item.name} [${listItem.type}]`
              listItem.use_amount = Number(listItem.use_amount || 0)
            })
          }
        })

        footerDataCol.value = footerData || []
        
        const Construction = list.find(item => item.type === 'Construction')
        buildAmount.value = Construction ? (Number(Construction.loan) || 0) : 0

        borrowerEquity.value = Construction ? (Number(Construction.borrower_equity) || 0) : 0
      })
      await getSetedData()
    } catch (err) {
      pageLoading.value = false
    }
  }

  const advanceBlur = () => {
    if (props.isOpen) {
      const amount = Number(advanceAmount.value)
      const useAmount = Number(advanceObj.value.use_amount)
      if (amount < useAmount) {
        advanceAmount.value = useAmount
        advanceObj.value.showError = false
      }
    }
  }

  const hasReseted = ref(false)
  const initHandle = (flag = false, tableTotal = false) => {
    // 如果为open后修改， 这里其实只有第一项触发这个事件
    if (props.isOpen) {
      const amount = Number(advanceAmount.value)
      const useAmount = Number(advanceObj.value.use_amount)
      if (amount < useAmount) {
        advanceObj.value.showError = true
      }
    } else {
      if (!flag) { // 重新计算payment数据
        const paymentData = cloneDeep(columnsTypeData.value)
        
        // 计算borrowerEquity占比
        const borrowerEquityPercent = tool.times(tool.div(borrowerEquity.value, calcBuildAmount.value), 100)
        let remainingPercent = borrowerEquityPercent

        // 遍历paymentData，处理相同name的情况
        for (let i = 0; i < paymentData.length; i++) {
          // 检查当前项是否有前一项
          if (i > 0 && paymentData[i].name === paymentData[i-1].name) {
            // 获取前一项的defaultNote
            const prevDefaultNote = Number(paymentData[i-1].defaultNote)
            
            if (remainingPercent > 0) {
              if (tool.gte(prevDefaultNote, remainingPercent)) {
                // 如果defaultNote大于等于剩余占比
                paymentData[i].note = Number(Number(remainingPercent).toFixed(30))
                paymentData[i-1].note = Number(Number(tool.minus(prevDefaultNote, remainingPercent)).toFixed(30))
                remainingPercent = 0
              } else {
                // 如果defaultNote小于剩余占比，则第二项note为defaultNote，第一项note为0
                paymentData[i].note = Number(Number(prevDefaultNote).toFixed(30))
                paymentData[i-1].note = 0
                // 更新剩余占比
                remainingPercent = Number(Number(tool.minus(remainingPercent, prevDefaultNote)).toFixed(30))
              }
            } else {
              paymentData[i-1].note = Number(Number(prevDefaultNote).toFixed(30))
              paymentData[i].note = 0
            }
          }
        }

        // 更新columnsTypeObj
        const obj = {}
        for (let i = 0; i < paymentData.length; i++) {
          obj[`${paymentData[i].code}`] = paymentData[i].note
        }
        columnsTypeObj.value = obj
        columnsTypeData.value = paymentData
      }

      for (let i = 0; i < tableData.value.length; i++) {
        // 计算使用的 payment：计算使用原始精度，展示时再四舍五入，避免因显示四舍五入导致总额偏差
        const originPayment = columnsTypeObj.value[`${tableData.value[i].typeId}$${tableData.value[i].category}`]
        const paymentForCalc = flag
          ? Number(tableData.value[i].payment)
          : Number(originPayment || 0)
        const paymentDisplay = Number(paymentForCalc).toFixed(2)

        // 保存高精度原始值，供后续拆分/重算使用
        tableData.value[i].payment_raw = paymentForCalc

        const itemPer = paymentForCalc / 100
        const itemTotal = Number(Number(tool.times(itemPer, calcBuildAmount.value)).toFixed(2))

        const amountArr = extractArrData(tableData.value[i], '-')

        const sqmObj = cloneDeep(securitySqmObj.value);
        if (tableData.value[i]['boc-payment-amount']) {
          const bocItem = tableData.value[i]['boc-payment-amount'];
          const sqmTotal = Object.values(sqmObj).reduce((total, num) => {
            return Number(tool.plus(total, num))
          }, 0);
          const rePerToal = tool.minus(sqmTotal, Number(bocItem.per))

          for (const key in sqmObj) {
            sqmObj[key] = Number(rePerToal) ? Number(Number(tool.times(sqmObj[key], Number(rePerToal))).toFixed(30)) : 0
          }
          sqmObj['boc-payment-amount'] = Number(Number(bocItem.per).toFixed(30))
        }
        let itemAmountTotal = 0
        for (let j = 0; j < amountArr.length; j++) {
          if (tableTotal) {
            const itemAmount = tableData.value[i][amountArr[j]].amount
            itemAmountTotal = tool.plus(itemAmountTotal, itemAmount)
          }
          if (j === amountArr.length - 1) {
            if (!tableTotal) {
              tableData.value[i][amountArr[j]].amount = Number(Number(tool.minus(itemTotal, itemAmountTotal)).toFixed(2))
            }
          } else {
            const per = sqmObj[amountArr[j]] || 0
            const amount = Number(Number(tool.times(per, itemTotal)).toFixed(2))

            if (!tableTotal) {
              itemAmountTotal = tool.plus(itemAmountTotal, amount)
              tableData.value[i][amountArr[j]].amount = amount
            }
          }
        }
        if (!flag) {
          tableData.value[i].payment = paymentDisplay
        }

        if (tableTotal) {
          const paymentStr = tool.div(itemAmountTotal, calcBuildAmount.value)
          tableData.value[i].payment = Number(tool.times(Number(paymentStr), 100)).toFixed(2)
        }
        
        tableData.value[i].total = tableTotal ? itemAmountTotal : itemTotal
      }

      if (!flag) {
        hasReseted.value = true
      }
    }
  }

  const restoreHandle = async () => {
    await getProjectData()
    hasReseted.value = false
  }

  const bocSplitObjRef = ref({})

  // 项数据
  const columnsTypeData = ref([])
  const columnsTypeObj = ref({})
  const columnsType = () => {
    // 计算borrowerEquity占比
    const borrowerEquityPercent = calcBuildAmount.value ? tool.times(tool.div(borrowerEquity.value, calcBuildAmount.value), 100) : 0
    let remainingPercent = borrowerEquityPercent

    systemDictDataApi({
      code: 'build_type_vsl',
      is_note: 1
    }).then(res => {
      const data = res || []
      // 在每一项后面添加复制数据
      const newData = []

      // boc拆分数据初始化
      const bocSplitObj = {}

      data.forEach(item => {
        const code = item.code
        item.code = code + '$1'
        item.defaultNote = item.note
        item.note = item.note ? Number(item.note) : 0

        bocSplitObj[`${item.code}|${item.name}`] = {
          amount: 0,
          source: 1,
          type: item.code,
          type_name: item.name,
          term: '',
          use_amount: 0,
          per: 0
        }
        
        // 计算当前item的borrowerEquity部分
        let borrowerNote = 0
        if (remainingPercent > 0) {
          // 如果borrowerEquity还有剩余百分比
          if (tool.gte(item.note, remainingPercent)) {
            // 如果当前item的note大于等于剩余百分比，直接使用剩余百分比
            borrowerNote = Number(Number(remainingPercent).toFixed(30))
            remainingPercent = 0
          } else {
            // 如果当前item的note小于剩余百分比，使用item.note
            borrowerNote = Number(Number(item.note).toFixed(30))
            remainingPercent = Number(Number(tool.minus(remainingPercent, item.note)).toFixed(30))
          }
        }

        // 创建Loan部分的数据
        newData.push({
          ...item,
          note: Number(Number(tool.minus(item.note, borrowerNote)).toFixed(30)) // 减去borrowerEquity部分
        })

        const newItem = {
          ...item,
          code: code + '$2',
          note: borrowerNote // 使用计算出的borrowerEquity部分
        }

        bocSplitObj[`${newItem.code}|${item.name}`] = {
          amount: 0,
          source: 1,
          type: newItem.code,
          type_name: item.name,
          term: '',
          use_amount: 0,
          per: 0
        }

        delete newItem.defaultNote

        // 创建Borrower Equity部分的数据
        newData.push(newItem)
      })

      // boc拆分底部数据
      const footerCopyData = cloneDeep(footerDataCol.value);
      const footerCopyObj = {}

      for (let i = 0; i < footerCopyData.length; i++) {
        const item = footerCopyData[i]
        if (item.list && item.list.length) {
          for (let j = 0; j < item.list.length; j++) {
            const listItem = item.list[j]
            const listName = `${item.name} [${listItem.type}]`
            footerCopyObj[listName] = {
              amount: 0,
              source: 1,
              type: listItem.type,
              type_name: listName,
              term: '',
              use_amount: 0,
              per: 0
            }
          }
        } else {
          footerCopyObj[item.name] = {
            amount: 0,
            source: 1,
            type: item.type,
            type_name: item.name,
            term: '',
            use_amount: 0,
            per: 0
          }
        }
      }
      bocSplitObjRef.value = {...cloneDeep(bocSplitObj), ...cloneDeep(footerCopyObj)}

      const setedDataObj = cloneDeep(setedData.value)
      const progressData = setedDataObj.progress || {}

      for (const key in progressData) {
        const item = progressData[key]
        for (let i = 0; i < item.length; i++) {
          let typeName = item[i].type_name
          if (item[i].type !== item[i].type_name && item[i].type_name.indexOf(item[i].type) === -1) {
            typeName = `${item[i].type}|${item[i].type_name}`
          }
          if (bocSplitObjRef.value[typeName]) {
            bocSplitObjRef.value[typeName] = {
              ...bocSplitObjRef.value[typeName],
              ...item[i],
              use_amount: Number(item[i].use_amount || 0)
            }
          }
        }
      }
      columnsTypeData.value = newData

      const obj = {}
      for (let i = 0; i < columnsTypeData.value.length; i++) {
        obj[`${columnsTypeData.value[i].code}`] = columnsTypeData.value[i].note
      }
      columnsTypeObj.value = obj
    })
  }

  const changeAlertRef = ref()
  const confirmTxt = ref('')
  const changeVisible = ref(false)
  const changeColseBtn = ref(false)

  const currentParams = ref()
  const subLoading = ref(false)

  const submitRquest = () => {
    const params = cloneDeep(currentParams.value)
    const ajaxFn = props.isOpen ? projectLoanSaveBuild : projectSaveBuild

    subLoading.value = true

    ajaxFn(params).then(() => {
      subLoading.value = false
      changeVisible.value = false
      changeColseBtn.value = false
      changeAlertRef.value.changeLoading(false)
      restoreHandle()

      goBack()
    }).catch(() => {
      subLoading.value = false
      changeAlertRef.value.changeLoading(false)
    })
  }

  // 数据是否有变化
  const dataHasChanged = (arr1, arr2) => {
    for (let i = 0; i < arr1.length; i++) {
      if (Number(arr1[i]) !== Number(arr2[i])) {
        return true
      }
    }
    return false
  }

  const submitHandle = () => {
    const security_uuid = []
    for (let i = 0; i < tableHeader.value.length; i++) {
      if (tableHeader.value[i].dataIndex.indexOf('-') > -1) {
        security_uuid.push(tableHeader.value[i].dataIndex)
      }
    }
    const paymentResData = setedData.value.payment
    const summaryResData = setedData.value.summary

    const build = []
    const paymentData = []
    for (let i = 0; i < tableData.value.length; i++) {
      const item = tableData.value[i]
      for (const key in item) {
        if (key.indexOf('-') > -1) {
          build.push({
            id: item[key].id || 0,
            amount: item[key].amount || 0,
            use_amount: item[key]?.use_amount || 0,
            security_uuid: key,
            type: item.typeId,
            category: item.category,
            type_name: item.type
          })
        }

        if (key === 'payment' && item.typeId) {
          paymentData.push({
            id: paymentResData[`${item.typeId}$${item.category}__payment`] ? paymentResData[`${item.typeId}$${item.category}__payment`].id : 0,
            amount: Number(item[key]),
            use_amount: 0,
            security_uuid: '',
            type: item.typeId,
            category: item.category,
            type_name: item.type
          })
        }
      }
    }

    // 首次放款百分比
    paymentData.unshift({
      id: paymentResData[`0$1__payment`] ? paymentResData[`0$1__payment`].id : 0,
      amount: advancePercent.value,
      use_amount: 0,
      security_uuid: '',
      type: 0,
      type_name: advanceKey.value,
      category: 1
    })

    // 首次放款值
    const summaryData = [{
      id: summaryResData[`${advanceKey.value}`] ? summaryResData[`${advanceKey.value}`].id : 0,
      amount: advanceAmount.value,
      use_amount: 0,
      type_name: advanceKey.value,
      security_uuid: '',
      type: 0,
      category: 1
    }]

    for (let i = 0; i < footerDataCol.value.length; i++) {
      const item = footerDataCol.value[i]

      // 子集数据
      if (item.list && item.list.length) {
        for (let j = 0; j < item.list.length; j++) {
          const listItem = item.list[j]
          summaryData.push({
            id: summaryResData[`${item.name} [${listItem.type}]`] ? summaryResData[`${item.name} [${listItem.type}]`].id : 0,
            amount: listItem.loan,
            use_amount: 0,
            type_name: `${item.name} [${listItem.type}]`,
            security_uuid: '',
            type: 0,
            category: 1
          })
        }
      } else { // 没有子集数据
        summaryData.push({
          id: summaryResData[`${item.name}`] ? summaryResData[`${item.name}`].id : 0,
          amount: item.loan,
          use_amount: 0,
          type_name: item.name,
          security_uuid: '',
          type: 0,
          category: 1
        })
      }
    }

    const construction = easyModel.value ? buildAmount.value : Number(TableLoanTotal.value(1))

    const params = {
      security_uuid,
      build,
      uuid: uuid.value,
      payment: paymentData,
      summary: summaryData,
      construction: construction,
      clear: 0
    }

    const arr = []
    const bocSplitObj = cloneDeep(bocSplitObjRef.value)
    for (const key in bocSplitObj) {
      if (bocSplitObj[key].amount > 0) {
        arr.push(bocSplitObj[key])
      }
    }
    params.progress = arr

    currentParams.value = cloneDeep(params)
    changeColseBtn.value = false

    const setLoanTotal = TableLoanTotal.value(1)
    const setBeTotal =TableLoanTotal.value(2)

    if ((setLoanTotal !== buildAmount.value) && !easyModel.value) {
      const diffNum = tool.minus(buildAmount.value, setLoanTotal)

      confirmTxt.value = t(`开发成本中的建造费为：<span>{0}</span>，当前设置值为：<span>{1}</span>，相差：<span>{2}</span>`, [
        `$${numberStrFormat(buildAmount.value)}`,
        `$${numberStrFormat(setLoanTotal)}`,
        `$${numberStrFormat(diffNum)}`
      ])

      changeColseBtn.value = true
      changeVisible.value = true

      return
    }

    if ((setBeTotal !== borrowerEquity.value) && !easyModel.value) {
      const diffNum = tool.minus(borrowerEquity.value, setBeTotal)

      confirmTxt.value = t(`开发成本中的借款人出资为：<span>{0}</span>，当前设置值为：<span>{1}</span>，相差：<span>{2}</span>`, [
        `$${numberStrFormat(borrowerEquity.value)}`,
        `$${numberStrFormat(setBeTotal)}`,
        `$${numberStrFormat(diffNum)}`
      ])

      changeColseBtn.value = true
      changeVisible.value = true

      return
    }

    if (props.isOpen) {
      // open 后处理 暂定
      submitRquest()
    } else {
      const sLen = securityData.value.length
      const rLen = Object.keys(setedData.value.row).length
      if (rLen && sLen !== rLen && !easyModel.value) {
        confirmTxt.value = t(`抵押物数量有变动，保存后会重置首次建筑贷款放款额`)
        currentParams.value.clear = 1
        changeVisible.value = true
      } else {
        const arr1 = paymentData.map(item => item.amount)
        const arr2 = []
        if (Object.keys(setedData.value.payment).length) {
          for (const key in setedData.value.payment) {
            arr2.push(setedData.value.payment[key].amount)
          }
        }
        if (rLen) {
          if (dataHasChanged(arr1, arr2)) {
            confirmTxt.value = t(`数据设置有变动，保存后会重置首次建筑贷款放款额`)
            currentParams.value.clear = 1
            changeVisible.value = true
          } else {
            submitRquest()
          }
        } else {
          submitRquest()
        }
      }
    }
  }

  const exportHandle = () => {
    const headerData = cloneDeep(tableHeader.value)
    headerData.splice(1, 1)
    headerData.splice(headerData.length - 1, 1)

    const data = cloneDeep(tableData.value)
    const tableNumData = data.filter(item => !item.isFixedRow)
    tableNumData.forEach(item => {
      for (const key in item) {
        if (key.indexOf('-') > -1) {
          item[key] = item[key].amount
        }
      }
    })
    const nameStr = `${projectDetail.value.base.project_apply_sn}`
    exportTableToExcel(tableNumData, headerData, nameStr)
  }

  const importHandle = (event) => {
    const fileInput = event.target;
    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // 读取第一个 sheet
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      // 转换为 JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const numData = jsonData.filter(item => !['Type', 'Initial advance to fund deposit', '类型'].includes(item[0]))
      tableDataFill(numData)

      // 主动清除 input 内容
      fileInput.value = ''
    };

    reader.readAsArrayBuffer(file);
  }

  const tableDataFill = (data) => {
    const headerData = cloneDeep(tableHeader.value)
    headerData.splice(1, 1)

    const typeOneStrData = []
    const typeOneData = []
    const typeTwoData = []

    data.forEach(row => {
      const type = row[0]
      if (typeOneStrData.includes(type)) {
        typeTwoData.push(row)
      } else {
        typeOneStrData.push(type)
        typeOneData.push(row)
      }
    })

    typeOneData.forEach(row => {
      const type = row[0]
      const targetRow = tableData.value.find(item => !item.isFixedRow && item.type === type)

      if (targetRow) {
        for (let j = 1; j < row.length; j++) {
          const header = headerData[j]
          if (!header) continue

          const dataIndex = header.dataIndex
          if (targetRow[dataIndex]) {
            targetRow[dataIndex].amount = row[j] || 0
          }
        }
      }
    })

    typeTwoData.forEach(row => {
      const type = row[0]
      const targetRow = tableData.value.findLast(item => !item.isFixedRow && item.type === type)

      if (targetRow) {
        for (let j = 1; j < row.length; j++) {
          const header = headerData[j]
          if (!header) continue

          const dataIndex = header.dataIndex
          if (targetRow[dataIndex]) {
            targetRow[dataIndex].amount = row[j]
          }
        }
      }
    })

    initHandle(true, true)
  }

  const recalcBocRows = (startIndex) => {
    const recalcRow = (row) => {
      if (!row) return

      // 优先使用高精度原始值（initHandle 保存的 payment_raw），否则退回显示值
      const payment = Number(row.payment_raw ?? row.payment) || 0
      // 使用高精度计算占比，保持与 initHandle 一致的精度（30 位）
      const itemPer = Number(Number(tool.div(payment, 100)).toFixed(30))
      const itemTotal = Number(Number(tool.times(itemPer, calcBuildAmount.value)).toFixed(2))
      const amountArr = extractArrData(row, '-')
      const sqmObj = cloneDeep(securitySqmObj.value)

      if (row['boc-payment-amount']) {
        const bocItem = row['boc-payment-amount']
        const sqmTotal = Object.values(sqmObj).reduce((total, num) => {
          return Number(tool.plus(total, num))
        }, 0)
        const rePerToal = tool.minus(sqmTotal, Number(bocItem.per))

        for (const key in sqmObj) {
          sqmObj[key] = Number(rePerToal) ? Number(Number(tool.times(sqmObj[key], Number(rePerToal))).toFixed(30)) : 0
        }
        sqmObj['boc-payment-amount'] = Number(Number(bocItem.per).toFixed(30))
      }

      if (!amountArr.length) return

      // 与 initHandle 同步的拆分逻辑：先按占比取两位小数，尾差补在最后一项
      let distributed = 0
      for (let j = 0; j < amountArr.length; j++) {
        if (j === amountArr.length - 1) {
          // 最后一项承担尾差，确保总和等于 itemTotal
          let lastAmount = Number(Number(tool.minus(itemTotal, distributed)).toFixed(2))
          // 如果因浮点误差导致负数或多余，进行一次补差
          const finalSum = Number(tool.plus(distributed, lastAmount))
          const diff = Number(Number(tool.minus(itemTotal, finalSum)).toFixed(2))
          if (diff !== 0) {
            lastAmount = Number(Number(tool.plus(lastAmount, diff)).toFixed(2))
          }
          row[amountArr[j]].amount = lastAmount
        } else {
          const per = sqmObj[amountArr[j]] || 0
          const amount = Number(Number(tool.times(per, itemTotal)).toFixed(2))
          distributed = Number(tool.plus(distributed, amount))
          row[amountArr[j]].amount = amount
        }
      }

      row.total = Number(Number(itemTotal).toFixed(2))
    }

    recalcRow(tableData.value[startIndex])
    recalcRow(tableData.value[startIndex + 1])
  }

  const bocInitSplitIndex = ref(0)
  const bocInitSplitFormstate = ref({
    loan: 0,
    borrowerEquity: 0
  })

  const bocInitSplitVisible = ref(false)

  const bocInitSplitCancelHandle = () => {
    bocInitSplitFormstate.value = {
      loan: 0,
      borrowerEquity: 0
    }
    bocInitSplitVisible.value = false
  }

  const bocInitSplitSureHandle = () => {
    const { loan, borrowerEquity } = bocInitSplitFormstate.value

    if (Number(loan) > 100 || Number(loan) < 0) {
      message.error(t('比例范围为{0}-{1}', [0, 100]))
      return
    }

    if (Number(borrowerEquity) > 100 || Number(borrowerEquity) < 0) {
      message.error(t('比例范围为{0}-{1}', [0, 100]))
      return
    }

    tableData.value[bocInitSplitIndex.value]['boc-payment-amount'].per = tool.div(Number(loan), 100)
    tableData.value[bocInitSplitIndex.value + 1]['boc-payment-amount'].per = tool.div(Number(borrowerEquity), 100)

    recalcBocRows(bocInitSplitIndex.value)

    bocInitSplitCancelHandle()
  }

  const bocInitSplitHandle = (index) => {
    bocInitSplitIndex.value = index

    bocInitSplitFormstate.value.loan = Number(tool.times(Number(tableData.value[index]['boc-payment-amount'].per), 100))
    bocInitSplitFormstate.value.borrowerEquity = Number(tool.times(Number(tableData.value[index + 1]['boc-payment-amount'].per), 100))

    bocInitSplitVisible.value = true
  }

  onMounted(async () => {
    const { fullPath, query } = route
    isRequests.value = fullPath.indexOf('requests') > -1
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
    :deep(.ant-table-wrapper) {
      .ant-table-tbody>tr>td {
        padding-left: 10px;
        padding-right: 10px;
      }
    }
  }

  .input-item {
    width: 220px;
    > p {
      font-size: 12px;
      color: #888;
      margin-bottom: 8px;
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
      .boc-payment-col {
        background-color: #fff1d6 !important;
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

  .amortized-text {
    text-align: right;
    margin-top: 10px;
    font-size: 16px;
    :deep(em) {
      padding-right: 20px;
      font-style: normal;
      font-size: 14px;
      color: #333;
    }
    :deep(span) {
      color: @colorPrimary !important;
      font-weight: 500;
    }
    :deep(i) {
      font-size: 12px;
      padding-left: 2px;
      color: #eb4b6d;
      &.borrower {
        color: #31bd65;
      }
    }
  }

  .amount-info {
    font-size: 12px;
    color: #888;
    display: flex;
    align-items: center;
    gap: 4px;
    > p {
      &:last-child {
        color: #333;
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
    background-color: #f8f8f8;
    &.easy-model {
      border-top: 1px solid #272727;
      margin-top: 10px;
    }
    > .item {
      border-bottom: 1px solid #272727;
      padding: 10px 15px;
      min-height: 45px;
      &.total {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      &:last-child {
        border-bottom: none;
      }
      :deep(.ant-input-number) {
        border-color: #272727;
        .ant-input-number-handler-wrap {
          display: none !important;
        }
      }
      > .child-content {
        background-color: #f0f0f0;
        padding: 0 10px;
        border-radius: 5px;
        margin-bottom: 10px;
        > .child-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #ddd;
          padding: 10px 0;
          &:last-child {
            border-bottom: none;
          }
          > p {
            color: #444;
          }
        }
      }
      > .item-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .total-item {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 10px;
      }
    }
  }

  .input-error {
    width: 100%;
    font-size: 12px;
    color: #eb4b6d;
    text-align: left;
    margin-top: 2px;
    &.text-center {
      text-align: center !important;
    }
  }

  .excel-upload {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    opacity: 0;
    cursor: pointer;
  }

  .total-info-txt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    font-size: 10px;
  }

  .boc-init-split {
    background-color: #f7f9f8;
    margin-bottom: 5px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #282828;
    > .top-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
      border-bottom: 1px dashed #282828;
    }
    > .bottom-info {
      font-size: 11px;
    }
  }

  .footer-boc-split {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 415px;
    &.has-child {
      width: 405px;
    }
    > div {
      width: 130px;
      display: flex;
      flex-direction: column;
      align-items: center;
      :deep(.ant-input-number) {
        background-color: #fff1d6;
      }
    }
  }
</style>