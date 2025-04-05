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
              
              <div class="flex gap-5">
                <a-popconfirm :title="t('确定重置吗？')" @confirm="resetHandle">
                  <a-button
                    type="primary"
                    class="uppercase flex items-center"
                  >
                    {{ t('重置进度付款') }}
                    <a-tooltip>
                      <template #title>
                        <span>{{ t('重置后数据会按照最新建筑贷款总额和建筑总面积，重新计算进度付款数据') }}</span>
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
            <div class="mt-2 amount-info">
              <p>{{ t('土地贷款总额') }}:</p>
              <p>{{ `$${numberStrFormat(landAmount)}` }}</p>
            </div>
          </div>
          

          <div class="form-block-content">
            <div class="title">{{ t('最新均摊值') }}</div>
            <a-table
              v-if="amortizedHeader.length"
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
  import { projectAuditStepDetail, projectAuditSecurityList, projectAuditSaveMode } from "@/api/process"
  import { projectDetail } from "@/api/project/project"
  import { cloneDeep } from "lodash"
  import { message } from 'ant-design-vue/es';
  import tool, { numberStrFormat } from "@/utils/tool"

  const { t } = useI18n();
  const route = useRoute();

  const uuid = ref('')

  const pageLoading = ref(false)

  const projectInfo = ref()
  const canModifyBamount = ref(false)

  // 建筑放款额
  const buildAmount = ref(0)
  const buildAmountSta = ref(0)

  const landAmount = ref(0)

  // 是否为进件阶段
  const isRequests = ref(false)

  // 请求抵押物信息
  const securityData = ref([])
  const getSecurityData = async () => {
    const params = {
      uuid: uuid.value,
      type: 2
    }

    try {
      if (isRequests.value) {
        const { list } = await projectAuditSecurityList(params)
        securityData.value = list
      } else {
        await projectDetail(params).then(res => {
          console.log('res', res);
        })
      }

      setAmortizedTable()

      pageLoading.value = false
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
        width: 140,
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
    { title: t('总计'), dataIndex: 'total', width: 140, align: 'center', fixed: 'right' }]


    setAmortizedData(itemData)
  }

  // 请求已设置数据
  const setedData = ref([])
  const getSetedData = async () => {
    const params = {
      uuid: uuid.value
    }

    try {
      if (isRequests.value) {
        await projectAuditStepDetail(params).then(res => {
          setedData.value = []
        })
      } else {
        await projectDetail(params).then(res => {
          console.log('res', res);
        })
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
          projectInfo.value = res
        })
      } else {
        await projectDetail(params).then(res => {
          console.log('res', res);
        })
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
  const resetHandle = () => {
    hasReseted.value = true
  }

  const restoreHandle = async () => {
    await getProjectData()
    hasReseted.value = false
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
    margin-bottom: 20px;
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
      .ant-table-container {
        border-radius: 0 !important;
      }
      .ant-table {
        background-color: transparent;
        border-spacing: 10px;
        table {
          border-top: none !important;
          border-radius: 0 !important;
        }
      }
      .ant-table-cell-fix-right-first {
        // right: -1px !important;
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
</style>
