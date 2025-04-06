<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="progress-payment-content">
        <template v-if="(securityData.length || setedData.length) && !pageLoading">
          <div class="sys-form-content block-item details">
            <div class="flex justify-between items-end">
              <div class="flex items-end gap-10">
                <div class="input-item">
                  <p>{{ t('建筑贷款总额') }}</p>
                  <a-input-number
                    v-model:value="buildAmount"
                    :max="99999999999"
                    :disabled="!canModifyBamount"
                    :formatter="
                      (value) =>
                        `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                    "
                    :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                  />
                </div>
                <a-button
                  v-if="canModifyBamount"
                  type="dark"
                  class="big shadow bold uppercase"
                  :loading="amountLoading"
                  @click="saveAmount"
                >{{ t('更新建筑贷款金额') }}</a-button>
              </div>
            </div>
            <div class="mt-2 amount-info">
              <p>{{ t('土地贷款总额') }}:</p>
              <p>{{ `$${numberStrFormat(landAmount)}` }}</p>
            </div>
          </div>
          
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
              <div class="flex gap-5">
                <a-popconfirm :title="t('确定操作吗？')" @confirm="initHandle(true)">
                  <a-button
                    type="dark"
                    class="uppercase flex items-center"
                  >
                    {{ t('按比例设置金额') }}
                  </a-button>
                </a-popconfirm>

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
                <template v-if="column.dataIndex === 'type'">
                  <p>{{ record[column.dataIndex] }}</p>
                </template>
                <template v-else-if="column.dataIndex === 'payment'">
                  <a-input
                    v-model:value="record[column.dataIndex]"
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
                    @input="itemInput(record)"
                  />
                </template>
              </template>
              <template #summary>
                <a-table-summary fixed>
                  <a-table-summary-row>
                    <a-table-summary-cell v-for="(item, index) in summaryCol" :index="index" :key="item.key" class="text-center">
                      <template v-if="item.key === 'type'">
                        {{ t('概括') }}
                      </template>
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
              <div v-for="item in otherInfoObj" :key="item.type_name" class="item">
                <p>{{ item.title }}</p>
                <a-input-number
                  v-model:value="otherInfo[item.type_name]"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </div>
              <div class="item">
                <p>Total Cost to Complete</p>
                <div class="total-item">
                  <vco-number :value="tableTotal" size="fs_xl" :precision="2" :end="true"></vco-number>
                </div>
              </div>
            </div>
            <div class="mt-5 flex justify-end">
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
    projectAuditSaveMode,
    projectGetBuild,
    projectSaveBuild
  } from "@/api/process"
  import { systemDictDataApi } from "@/api/system/index"
  import { cloneDeep } from "lodash"
  import { message } from 'ant-design-vue/es';
  import tool, { numberStrFormat } from "@/utils/tool"
  import { otherInfoObj } from "./../config.js"

  const { t } = useI18n();
  const route = useRoute();

  const uuid = ref('')

  const pageLoading = ref(false)

  const canModifyBamount = ref(false)

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

  const summaryHandle = computed(() => {
    return (key) => {
      const arr = tableData.value.map(item => item[key])
      const numArr = isNaN(Number(arr[0])) ? arr.map(item => Number(item.amount)) : arr.map(item => Number(item))
      const total = numArr.reduce((total, num) => total + num, 0);
      return total
    }
  })

  const totalColor = computed(() => {
    return (num) => {
      if (num > buildAmountSta.value) {
        return '#eb4b6d'
      } else if (num < buildAmountSta.value) {
        return '#31bd65'
      } else {
        return '#282828'
      }
    }
  })

  const tableTotal = computed(() => {
    const tableNum = summaryHandle.value('total')
    const inputArr = []
    for (const key in otherInfo.value) {
      const num = otherInfo.value[key] || 0
      inputArr.push(num)
    }
    const inputNum = inputArr.reduce((total, num) => total + num, 0);
    return tool.plus(tableNum, inputNum)
  })

  // 其他数据
  const otherInfo = ref({})
  const otherInfoObjSta = cloneDeep(otherInfoObj)
  for (let i = 0; i < otherInfoObjSta.length; i++) {
    otherInfo.value[otherInfoObjSta[i].type_name] = 0
  }

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

  const itemInput = (data) => {
    const amountArr = extractAmounts(data, '-')
    if (amountArr.length) {
      const sum = amountArr.reduce((total, num) => total + num, 0);
      const payment = tool.div(sum, buildAmountSta.value)

      data.payment = Number(tool.times(Number(payment), 100)).toFixed(2)
      data.total = sum
    }
  }

  const setTableData = (headerData) => {
    const data = cloneDeep(columnsTypeData.value)
    const hadSetData = cloneDeep(setedData.value.data)
    const dataArr = []
    for (let i = 0; i < data.length; i++) {
      const obj = {
        type: data[i].name,
        typeId: data[i].code
      }
      for (let j = 0; j < headerData.length; j++) {
        const amountItem = hadSetData[`${data[i].code}__${headerData[j].dataIndex}`] || null
        if (amountItem) {
          amountItem.amount = Number(amountItem.amount)
        }
        obj[headerData[j].dataIndex] = amountItem || { amount: 0}
      }

      const amountArr = extractAmounts(obj, '-')
      if (amountArr.length && Object.keys(setedData.value.data).length) {
        const sum = amountArr.reduce((total, num) => total + num, 0);
        const payment = tool.div(sum, buildAmountSta.value)
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

    summaryCol.value = summaryColData

    setTableData(headerData)
  }

  // 建筑放款额
  const buildAmount = ref(0)
  const buildAmountSta = ref(0)

  const landAmount = ref(0)

  const isRequests = ref(false)

  // 请求抵押物信息
  const securityData = ref([])
  const securitySqmObj = ref()
  const getSecurityData = async () => {
    const params = {
      uuid: uuid.value,
      type: 2
    }

    try {
      let dataArr = []
      if (isRequests.value) {
        const { list } = await projectAuditSecurityList(params)
        dataArr = list || []
      } else {
        console.log('222222');
      }

      securityData.value = dataArr

      setAmortizedTable()
      setTableHeader()
      pageLoading.value = false

      // 面积比例
      const sqmArr = dataArr.map(item => Number(item.sqm))
      const totalSqm = sqmArr.reduce((total, num) => total + num, 0);
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

    const calcNum = tool.div(buildAmountSta.value, totalSqm)
    amortizedCalc.value = `$${numberStrFormat(buildAmountSta.value)} ÷ ${obj.total} ≈ <span>$${numberStrFormat(calcNum)}</span>/m²`
    amortizedData.value = dataArr
  }

  const setAmortizedTable = () => {
    const data = cloneDeep(securityData.value)
    const itemData = data.filter(item => item.sqm)
    const headerData = []
    for (let i = 0; i < itemData.length; i++) {
      headerData.push({
        title: itemData[i].card_no,
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
  const getSetedData = async () => {
    const params = {
      uuid: uuid.value
    }

    try {
      if (isRequests.value) {
        await projectGetBuild(params).then(res => {
          const data = res.data || []
          if (Object.keys(data)) {
            setedData.value = res
          }

          if (Object.keys(res.summary)) {
            for (const key in otherInfo.value) {
              otherInfo.value[`${key}`] = res.summary[`${key}`] ? Number(res.summary[`${key}`].amount) : 0
            }
          }
        })
      } else {
        console.log('isRequests');
      }

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
      if (isRequests.value) {
        await projectAuditStepDetail(params).then(res => {
          buildAmount.value = Number(res.lending.build_amount)
          buildAmountSta.value =  Number(res.lending.build_amount)

          landAmount.value = res.lending.land_amount

          canModifyBamount.value = Boolean(res.base.status === 400)
        })
      } else {
        console.log('1111111');
      }

      await getSetedData()
    } catch (err) {
      pageLoading.value = false
    }
  }

  const amountLoading = ref(false)
  const saveAmount = () => {
    const num = Number(buildAmount.value)
    const total = num + Number(landAmount.value)
    if (num < 0 || (total < 0 || total === 0)) {
      message.error(t('借款总额不正确'))
    } else {
      const params = {
        build_amount: num,
        code: 'lending',
        uuid: uuid.value,
        set__bulid: 1
      }

      amountLoading.value = true

      projectAuditSaveMode(params).then(() => {
        amountLoading.value = false
        restoreHandle()
      }).catch(() => {
        amountLoading.value = false
      })
    }
  }

  const hasReseted = ref(false)
  const initHandle = (flag = false) => {
    for (let i = 0; i < tableData.value.length; i++) {
      let payment = columnsTypeObj.value[tableData.value[i].typeId]
      if (flag) {
        const itemPayment = Number(tableData.value[i].payment)
        payment = isNaN(itemPayment) ? 0 : itemPayment
      }
      const itemPer = Number(payment) / 100
      const itemTotal = tool.times(itemPer, buildAmountSta.value)

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

  const subLoading = ref(false)
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

        if (key === 'payment') {
          paymentData.push({
            id: paymentResData[`${i + 1}__payment`] ? paymentResData[`${i + 1}__payment`].id : 0,
            amount: Number(item[key]),
            use_amount: 0,
            security_uuid: '',
            type: Number(item.typeId),
            type_name: item.type
          })
        }
      }
    }

    const summaryData = []
    for (const key in otherInfo.value) {
      summaryData.push({
        id: summaryResData[`${key}`] ? summaryResData[`${key}`].id : 0,
        amount: otherInfo.value[`${key}`] ? Number(otherInfo.value[`${key}`]) : 0,
        use_amount: 0,
        security_uuid: '',
        type: 0,
        type_name: key
      })
    }

    const params = {
      security_uuid,
      build,
      uuid: uuid.value,
      summary: summaryData,
      payment: paymentData
    }

    subLoading.value = true

    projectSaveBuild(params).then(() => {
      subLoading.value = false
      restoreHandle()
    }).catch(() => {
      subLoading.value = false
    })
  }

  onMounted(async () => {
    const { fullPath, query } = route
    isRequests.value = fullPath.indexOf('requests') > -1
    uuid.value = query.uuid

    if (uuid.value) {
      columnsType()
      await getProjectData()
    }
  })
</script>

<style lang="less" scoped>
  @import '@/styles/variables.less';

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
      .ant-table-fixed-header .ant-table-container {
        // border-bottom: 1px solid #272727;
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
      height: 60px;
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
</style>
