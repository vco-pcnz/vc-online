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

    <vco-page-panel @back="goBack">
      <template #title>
        <div class="page-title-content">
          <div class="tag">{{ t('进度付款') }}</div>
        </div>
      </template>
    </vco-page-panel>

    <a-spin :spinning="pageLoading" size="large">
      <div class="progress-payment-content">
        <template v-if="(securityData.length || setedData.length) && !pageLoading">       
          <div v-if="amortizedHeader.length" class="form-block-content">
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
          </div>

          <div v-if="tableHeader.length" class="form-block-content">
            <div class="flex justify-between mb-2">
              <div class="title">{{ t('进度付款阶段') }}</div>
              <div v-if="!isOpen" class="flex gap-5">
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
            </div>
            <a-table
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
                    <p v-if="isOpen">{{ advancePercent }}%</p>
                    <a-input
                      v-else
                      v-model:value="advancePercent"
                      @input="() => advanceInput(true)"
                      suffix="%"
                    />
                  </template>
                  <template v-else-if="column.dataIndex === 'total'">
                    <vco-number :value="advanceAmount" size="fs_md" :precision="2" :end="true"></vco-number>
                  </template>
                  <template v-else>
                    <div class="flex justify-center flex-col items-center">
                      <a-input-number
                        v-model:value="advanceAmount"
                        :max="99999999999"
                        :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                        :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                        style="width: 200px;"
                        @input="() => advanceInput(false)"
                      />
                      <p v-if="advanceObj?.showError" class="input-error text-center">
                        {{ t('最小值:{0}', [`$${numberStrFormat(advanceObj.use_amount)}`]) }}
                      </p>
                      <div v-if="isOpen" class="mt-2">
                        <vco-number :value="advanceObj.use_amount" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
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
                  />
                </template>
                <template v-else-if="column.dataIndex === 'total'">
                  <vco-number :value="record[column.dataIndex]" size="fs_md" :precision="2" :end="true"></vco-number>
                </template>
                <template v-else>
                  <a-input-number
                    v-model:value="record[column.dataIndex].amount"
                    :max="99999999999"
                    :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                    :disabled="record[column.dataIndex].disabled"
                    @input="itemInput(record, record[column.dataIndex])"
                    @blur="inputBlur(record, record[column.dataIndex])"
                  />
                  <p v-if="record[column.dataIndex].showError" class="input-error">
                    {{ t('最小值:{0}', [`$${numberStrFormat(record[column.dataIndex].use_amount)}`]) }}
                  </p>
                  <div v-if="isOpen" class="mt-2">
                    <vco-number :value="record[column.dataIndex].use_amount" size="fs_md" color="#31bd65" :precision="2" :end="true"></vco-number>
                  </div>
                </template>
              </template>
              <template #summary>
                <a-table-summary fixed>
                  <a-table-summary-row>
                    <a-table-summary-cell v-for="(item, index) in summaryCol" :index="index" :key="item.key" class="text-center">
                      <template v-if="item.key === 'type'">Construction</template>
                      <template v-else-if="item.key === 'payment'">
                        <p class="total-percent"
                          :class="{'plus': summaryHandle(item.key) > 100, 'minus': summaryHandle(item.key) < 100}"
                        >{{ numberStrFormat(summaryHandle(item.key)) }}%</p>
                      </template>
                      <template v-else-if="item.key === 'total'">
                        <vco-number
                          :value="summaryHandle(item.key)"
                          size="fs_md"
                          :precision="2"
                          :end="true"
                          :color="totalColor(summaryHandle(item.key))"
                        ></vco-number>
                      </template>
                      <template v-else>
                        <vco-number :value="summaryHandle(item.key)" size="fs_md" :precision="2" :end="true"></vco-number>
                      </template>
                    </a-table-summary-cell>
                  </a-table-summary-row>
                </a-table-summary>
              </template>
            </a-table>
            <div class="other-table-info">
              <div v-for="item in footerDataCol" :key="item.type" class="item">
                <p>{{ item.name }}</p>
                <div class="total-item">
                  <vco-number :value="item.loan" size="fs_md" :precision="2" :end="true"></vco-number>
                </div>
              </div>
              <div class="item">
                <p>Total Cost to Complete</p>
                <div class="total-item">
                  <vco-number :value="tableTotal" size="fs_xl" :precision="2" :end="true"></vco-number>
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
        </template>

        <a-empty v-if="!securityData.length && !setedData.length && !pageLoading" />
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
        return tool.plus(total, advancePercent.value)
      } else if (key === 'total') {
        return tool.plus(total, advanceAmount.value)
      } else {
        return total
      }
    }
  })

  const totalColor = computed(() => {
    return (num) => {
      if (num > buildAmount.value) {
        return '#eb4b6d'
      } else if (num < buildAmount.value) {
        return '#31bd65'
      } else {
        return '#282828'
      }
    }
  })

  const tableTotal = computed(() => {
    const tableNum = summaryHandle.value('total')
    const inputArr = footerDataCol.value.map(item => item.loan)
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
      const sum = amountArr.reduce((total, num) => total + num, 0);
      const payment = tool.div(sum, buildAmount.value)

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
        typeId: data[i].code
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
        const payment = tool.div(sum, buildAmount.value)
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
    }, ...headerData,
    { title: t('总计'), dataIndex: 'total', width: 180, align: 'center', fixed: 'right' }]

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

  const isRequests = ref(false)

  // 请求抵押物信息
  const securityData = ref([])
  const securityDataObj = ref()
  const securitySqmObj = ref()
  const getSecurityData = async () => {
    const params = {
      uuid: uuid.value,
      type: 2
    }

    try {
      params.page = 1
      params.limit = 10000
      const { data } = await dischargeSecurity(params)
      const dataArr = data || []

      const dataObj = {}
      for (let i = 0; i < dataArr.length; i++) {
        dataObj[`${dataArr[i].uuid}`] = dataArr[i]
      }

      securityDataObj.value = dataObj

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

    const calcNum = tool.div(buildAmount.value, totalSqm)
    amortizedCalc.value = `$${numberStrFormat(buildAmount.value)} ÷ ${obj.total} ≈ <span>$${numberStrFormat(calcNum)}</span>/m²`
    amortizedData.value = dataArr
  }

  const setAmortizedTable = () => {
    const data = cloneDeep(securityData.value)
    const itemData = data.filter(item => item.sqm)
    const headerData = []
    for (let i = 0; i < itemData.length; i++) {
      let title = itemData[i].card_no
      if (props.isOpen && Boolean(itemData[i].status)) {
        title = `${title}${t('已解押')}）`
      }
      headerData.push({
        title,
        dataIndex: itemData[i].uuid,
        width: 150,
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

    setAmortizedData(itemData)
  }

  // 请求已设置数据
  const advanceKey = ref('Initial advance to fund deposit')
  const advanceObj = ref()
  const advancePercent = ref(0)
  const advanceAmount = ref(0)

  const advanceInput = (flag) => {
    if (flag) {
      const percent = Number(advancePercent.value) / 100
      advanceAmount.value = tool.times(percent, buildAmount.value)
    } else {
      const amount = Number(advanceAmount.value)
      advancePercent.value = tool.times(Number(tool.div(amount, buildAmount.value)), 100)

      if (props.isOpen) {
        const useAmount = Number(advanceObj.value.use_amount)
        if (amount < useAmount) {
          advanceObj.value.showError = true
        }
      }
    }
  }

  const getSetedData = async () => {
    const params = {
      uuid: uuid.value
    }

    try {
      await projectLoanGetBuild(params).then(res => {
        const data = res.data || []
        if (Object.keys(data)) {
          setedData.value = res

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

              advanceObj.value = res.summary[`${advanceKey.value}`]
              advanceObj.value.showError = false
            }

            const footerData = footerDataCol.value.map(item => {
              return {
                loan: res.summary[`${item.name}`].amount,
                ...item,
                ...res.summary[`${item.name}`]
              }
            })
            footerDataCol.value = footerData
          }
        } else {
          pageLoading.value = false
        }
      })

      await getSecurityData()
    } catch (err) {
      pageLoading.value = false
    }
  }

  // 请求项目信息
  const getProjectData = async () => {
    pageLoading.value = true

    const params = {
      uuid: uuid.value
    }

    try {
      await projectDetailApi(params).then(res => {
        emits('done', res)

        const list = res.lending.devCostDetail[0].data[0].list
        const filterType = ['Land', 'Construction', 'Refinance', 'Land_gst']
        const footerData = list.filter(item => !filterType.includes(item.type))

        footerDataCol.value = footerData || []
        
        const Construction = list.find(item => item.type === 'Construction')
        buildAmount.value = Construction ? Construction.loan : 0
      })
      await getSetedData()
    } catch (err) {
      pageLoading.value = false
    }
  }

  const hasReseted = ref(false)
  const initHandle = (flag = false) => {
    // 设置首项
    if (flag) {
      advanceAmount.value = tool.times((advancePercent.value / 100), buildAmount.value)
    } else {
      advancePercent.value = 0
      advanceAmount.value = 0
    }

    for (let i = 0; i < tableData.value.length; i++) {
      let payment = columnsTypeObj.value[tableData.value[i].typeId]
      if (flag) {
        const itemPayment = Number(tableData.value[i].payment)
        payment = isNaN(itemPayment) ? 0 : itemPayment
      }
      const itemPer = Number(payment) / 100
      const itemTotal = tool.times(itemPer, buildAmount.value)

      const amountArr = extractArrData(tableData.value[i], '-')
      let itemAmountTotal = 0
      for (let j = 0; j < amountArr.length; j++) {
        if (j === amountArr.length - 1) {
          tableData.value[i][amountArr[j]].amount = Number(tool.minus(itemTotal, itemAmountTotal))
        } else {
          const per = securitySqmObj.value[amountArr[j]] || 0
          const amount = Number(Number(tool.times(per, itemTotal)).toFixed(2))
          itemAmountTotal = tool.plus(itemAmountTotal, amount)
          tableData.value[i][amountArr[j]].amount = amount
        }
      }
      if (!flag) {
        tableData.value[i].payment = Number(payment).toFixed(2)
      }
      
      tableData.value[i].total = itemTotal
    }

    if (!flag) {
      hasReseted.value = true
    }
  }

  const restoreHandle = async () => {
    await getProjectData()
    hasReseted.value = false
  }

  // 项数据
  const columnsTypeData = ref([])
  const columnsTypeObj = ref({})
  const columnsType = () => {
    systemDictDataApi({
      code: 'build_type',
      is_note: 1
    }).then(res => {
      const data = res || []
      columnsTypeData.value = data

      const obj = {}
      for (let i = 0; i < data.length; i++) {
        obj[`${data[i].code}`] = data[i].note
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
            use_amount: item[key].use_amount || 0,
            security_uuid: key,
            type: Number(item.typeId),
            type_name: item.type
          })
        }

        if (key === 'payment' && i) {
          paymentData.push({
            id: paymentResData[`${i}__payment`] ? paymentResData[`${i}__payment`].id : 0,
            amount: Number(item[key]),
            use_amount: 0,
            security_uuid: '',
            type: Number(item.typeId),
            type_name: item.type
          })
        }
      }
    }

    // 首次放款百分比
    paymentData.unshift({
      id: paymentResData[`0__payment`] ? paymentResData[`0__payment`].id : 0,
      amount: advancePercent.value,
      use_amount: 0,
      security_uuid: '',
      type: 0,
      type_name: advanceKey.value,
    })

    // 首次放款值
    const summaryData = [{
      id: summaryResData[`${advanceKey.value}`] ? summaryResData[`${advanceKey.value}`].id : 0,
      amount: advanceAmount.value,
      use_amount: 0,
      type_name: advanceKey.value,
      security_uuid: '',
      type: 0
    }]

    for (let i = 0; i < footerDataCol.value.length; i++) {
      summaryData.push({
        id: summaryResData[`${footerDataCol.value[i].name}`] ? summaryResData[`${footerDataCol.value[i].name}`].id : 0,
        amount: footerDataCol.value[i].loan,
        use_amount: 0,
        type_name: footerDataCol.value[i].name,
        security_uuid: '',
        type: 0
      })
    }

    const construction = Number(summaryHandle.value('total'))

    const params = {
      security_uuid,
      build,
      uuid: uuid.value,
      payment: paymentData,
      summary: summaryData,
      construction: construction,
      clear: 0
    }

    currentParams.value = cloneDeep(params)
    changeColseBtn.value = false

    if (construction !== buildAmount.value) {
      const diffNum = tool.minus(construction, buildAmount.value)
      if (props.isOpen) {
        // open 后处理 暂定
        if (construction > buildAmount.value) {
          confirmTxt.value = t(`开发成本中的建造费为：<span>{0}</span>，当前设置值为：<span>{1}</span>，超出了：<span>{2}</span>`, [
            `$${numberStrFormat(buildAmount.value)}`,
            `$${numberStrFormat(construction)}`,
            `$${numberStrFormat(diffNum)}`
          ])
          changeVisible.value = true
          changeColseBtn.value = true
        } else {
          submitRquest()
        }
      } else {
        confirmTxt.value = t(`开发成本中的建造费为：<span>{0}</span>，当前设置值为：<span>{1}</span>，相差：<span>{2}</span>，保存后会更新相关值并重置首次建筑贷款放款额`, [
          `$${numberStrFormat(buildAmount.value)}`,
          `$${numberStrFormat(construction)}`,
          `$${numberStrFormat(diffNum)}`
        ])
        currentParams.value.clear = 1

        changeVisible.value = true
      }
    } else {
      if (props.isOpen) {
        // open 后处理 暂定
        submitRquest()
      } else {
        const sLen = securityData.value.length
        const rLen = Object.keys(setedData.value.row).length
        if (rLen && sLen !== rLen) {
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
  }

  onMounted(async () => {
    const { query } = route
    uuid.value = query.uuid

    if (uuid.value) {
      columnsType()
      await getProjectData()
    }
  })
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';
  .page-title-content {
    display: flex;
    align-items: center;
    gap: 15px;
    > .tag {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      font-weight: 500;
      font-size: 14px;
      letter-spacing: 1px;
      text-transform: uppercase;
      white-space: nowrap;
      background-color: @clr_charcoal;
      color: @clr_white;
      border-radius: 16px;
      padding: 0 30px;
      &:first-child {
        border-radius: 0 16px 16px 0 !important;
      }
      &.uppercase {
        padding: 0 20px;
        background-color: @colorPrimary;
      }
    }
  }

  .progress-payment-content {
    min-height: 300px;
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

  .amortized-text {
    text-align: right;
    margin-top: 10px;
    font-size: 16px;
    :deep(span) {
      color: @colorPrimary !important;
      font-weight: 500;
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
    > .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #272727;
      padding: 10px 15px;
      height: 45px;
      &:last-child {
        border-bottom: none;
      }
      :deep(.ant-input-number) {
        width: 150px;
        border-color: #272727;
        .ant-input-number-handler-wrap {
          display: none !important;
        }
        .ant-input-number-input {
          text-align: center;
        }
      }
      .total-item {
        min-width: 150px;
        display: flex;
        align-items: center;
        justify-content: center;
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
</style>
