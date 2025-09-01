<template>
  <div>
    <vco-page-panel v-if="!isVariation" @back="goBack">
      <template #title>
        <div class="page-title-content">
          <div v-if="dataInfo?.base?.project_apply_sn" class="tag">{{ `${dataInfo?.product?.name} - ${(dataInfo?.borrower?.organization_name || dataInfo?.base?.project_apply_sn)}` }}</div>
          <div class="tag uppercase">{{ t('抵押物统计数据') }}</div>
        </div>
      </template>
    </vco-page-panel>

    <a-spin :spinning="pageLoading" size="large">
      <div v-if="!isVariation" class="form-block-content">
        <a-table
          :columns="formColumns"
          :data-source="formDataSource"
          bordered
          :pagination="false"
          table-layout="fixed"
          :scroll="{ x: '100%', y: isVariation ? (isView ? 400 : 300) : 600 }"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'typology'">
              {{ typologyFormat(record) }}
            </template>
            <template v-if="column.dataIndex === 'sqm'">
              {{ `${record.sqm} m²` }}
            </template>
            <template v-if="['est_sales_price', 'amount', 'insurance_value', 'sales_price', 'repayment_price', 'net_proceeds_price', 'dup'].includes(column.dataIndex)">
              <vco-number size="fs_md" :value="record[column.dataIndex]" :precision="2" :end="true"></vco-number>
            </template>
            <template v-if="column.dataIndex === 'is_gst'">
              {{ Number(record.is_gst) ? t('是') : t('否') }}
            </template>
            <template v-if="column.dataIndex === 'is_calc'">
              {{ Number(record.is_calc) ? t('是') : t('否') }}
            </template>
            <template v-if="column.dataIndex === 'variance'">
              {{ `${record.variance}%` }}
            </template>
            <template v-if="['insurance_expire_date', 'contract_date', 'settlement_date', 'sunset_date', 'repayment_date'].includes(column.dataIndex)">
              {{ record[column.dataIndex] ? tool.showDate(record[column.dataIndex]) : '--' }}
            </template>
          </template>
          <template #summary>
            <a-table-summary fixed>
              <a-table-summary-row>
                <a-table-summary-cell v-for="(item, index) in summaryCol" :index="index" :key="item.key" class="text-center">
                  <template v-if="item.key === 'card_no'">
                    <p>{{ t('总条数') }}</p>
                    <p>{{ formDataSource.length }}</p>
                  </template>
                  <template v-else-if="item.key === 'typology'">
                    {{ totalTypology() }}
                  </template>
                  <template v-else-if="item.key === 'sqm'">
                    {{ totalSqm() }}
                  </template>
                  <template v-else-if="item.key === 'est_sales_price'">
                    {{ totalEstSprice() }}
                  </template>
                  <template v-else-if="item.key === 'amount'">
                    {{ totalSecurityValue() }}
                  </template>
                  <template v-else-if="item.key === 'insurance_value'">
                    {{ totalInsuranceValue() }}
                  </template>
                  <template v-else-if="item.key === 'sales_price'">
                    {{ totalSalesPrice() }}
                  </template>
                  <template v-else-if="item.key === 'repayment_price'">
                    {{ totalAmountReceived() }}
                  </template>
                  <template v-else-if="item.key === 'net_proceeds_price'">
                    {{ totalNetIncome() }}
                  </template>
                  <template v-else-if="item.key === 'dup'">
                    {{ totalDup() }}
                  </template>
                </a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </a-table>
      </div>

      <div v-if="securityData.length && isVariation" class="form-block-content">
        <a-table
          :columns="formColumns"
          :data-source="securityData"
          bordered
          :pagination="false"
          table-layout="fixed"
          :scroll="{ x: '100%', y: 400 }"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'typology'">
              {{ typologyFormat(record) }}
            </template>
            <template v-if="column.dataIndex === 'sqm'">
              {{ `${record.sqm} m²` }}
            </template>
            <template v-if="['est_sales_price', 'amount', 'insurance_value', 'sales_price', 'repayment_price', 'net_proceeds_price', 'dup'].includes(column.dataIndex)">
              <vco-number size="fs_md" :value="record[column.dataIndex]" :precision="2" :end="true"></vco-number>
            </template>
            <template v-if="column.dataIndex === 'is_gst'">
              {{ Number(record.is_gst) ? t('是') : t('否') }}
            </template>
            <template v-if="column.dataIndex === 'is_calc'">
              {{ Number(record.is_calc) ? t('是') : t('否') }}
            </template>
            <template v-if="column.dataIndex === 'variance'">
              {{ `${record.variance}%` }}
            </template>
            <template v-if="['insurance_expire_date', 'contract_date', 'settlement_date', 'sunset_date', 'repayment_date'].includes(column.dataIndex)">
              {{ record[column.dataIndex] ? tool.showDate(record[column.dataIndex]) : '--' }}
            </template>
          </template>
          <template #summary>
            <a-table-summary fixed>
              <a-table-summary-row>
                <a-table-summary-cell v-for="(item, index) in summaryCol" :index="index" :key="item.key" class="text-center">
                  <template v-if="item.key === 'card_no'">
                    <p>{{ t('总条数') }}</p>
                    <p>{{ securityData.length }}</p>
                  </template>
                  <template v-else-if="item.key === 'typology'">
                    {{ totalTypology(securityData) }}
                  </template>
                  <template v-else-if="item.key === 'sqm'">
                    {{ totalSqm(securityData) }}
                  </template>
                  <template v-else-if="item.key === 'est_sales_price'">
                    {{ totalEstSprice(securityData) }}
                  </template>
                  <template v-else-if="item.key === 'amount'">
                    {{ totalSecurityValue(securityData) }}
                  </template>
                  <template v-else-if="item.key === 'insurance_value'">
                    {{ totalInsuranceValue(securityData) }}
                  </template>
                  <template v-else-if="item.key === 'sales_price'">
                    {{ totalSalesPrice(securityData) }}
                  </template>
                  <template v-else-if="item.key === 'repayment_price'">
                    {{ totalAmountReceived(securityData) }}
                  </template>
                  <template v-else-if="item.key === 'net_proceeds_price'">
                    {{ totalNetIncome(securityData) }}
                  </template>
                  <template v-else-if="item.key === 'dup'">
                    {{ totalDup(securityData) }}
                  </template>
                </a-table-summary-cell>
              </a-table-summary-row>
            </a-table-summary>
          </template>
        </a-table>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { onMounted, ref, reactive, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { useRoute } from 'vue-router';
  import { 
    projectAuditSecurityList,
    projectDetailAuditSecurityList,
    projectDetailApi
  } from "@/api/process";
  import { dischargeSecurity } from '@/api/project/loan';
  import tool, { numberStrFormat, goBack } from '@/utils/tool';
  import { cloneDeep } from 'lodash';

  const props = defineProps({
    type: {
      type: String,
      default: ""
    },
    isVariation: {
      type: Boolean,
      default: false
    },
    isView: {
      type: Boolean,
      default: false
    },
    securityData: {
      type: Array,
      default: () => []
    }
  })

  const { t } = useI18n();
  const route = useRoute();
  const uuid = ref(route.query.uuid)

  // 户型统计
  const totalTypology = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const typologyArr = data.filter(item => item.typology).map(item => item.typology)

    const calc = typologyArr.reduce((acc, item) => {
      // 累加固定字段
      ['beds', 'lounge', 'bath', 'garage', 'level', 'carpark'].forEach(key => {
        acc[key] = (acc[key] || 0) + Number(item[key]);
      });

      // 统计 other 里的动态字段，过滤掉没有 key 的数据
      if (Array.isArray(item.other)) {
        item.other
        .filter(entry => entry.key) // 过滤 key 为空的项
        .forEach(({ key, value }) => {
            acc[key] = (acc[key] || 0) + Number(value);
        });
      }

      return acc;
    }, {});

    const txt = Object.entries(calc)
          .map(([key, value]) => `${value} ${key}`)
          .join(', ');
    return txt
  }

  // 总面积 - 支持传参数
  const totalSqm = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const sqmArr = data.map(item => item.sqm)
    const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    return `${numberStrFormat(sum)} m²`
  }

  // 总预测销售价
  const totalEstSprice = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const sqmArr = data.map(item => item.est_sales_price)
    const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    return `$${numberStrFormat(sum)}`
  }

  // 总担保价值
  const totalSecurityValue = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const sqmArr = data.map(item => item.amount)
    const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    return `$${numberStrFormat(sum)}`
  }

  // 总保险价值
  const totalInsuranceValue = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const sqmArr = data.map(item => item.insurance_value)
    const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    return `$${numberStrFormat(sum)}`
  }

  // 总销售价格
  const totalSalesPrice = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const sqmArr = data.map(item => item.sales_price)
    const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    return `$${numberStrFormat(sum)}`
  }

  // 总回款金额
  const totalAmountReceived = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const sqmArr = data.map(item => item.repayment_price)
    const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    return `$${numberStrFormat(sum)}`
  }

  // 总净收益
  const totalNetIncome = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const sqmArr = data.map(item => item.net_proceeds_price)
    const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    return `$${numberStrFormat(sum)}`
  }

  // 总每单位债务
  const totalDup = (dataSource = null) => {
    const data = cloneDeep(dataSource || formDataSource.value)
    const sqmArr = data.map(item => item.dup)
    const sum = sqmArr.reduce((acc, cur) => Number(acc) + Number(cur), 0);
    return `$${numberStrFormat(sum)}`
  }

  const typologyFormat = (data) => {
    if (data.typology) {
      let summary = { ...data.typology };

      // 确保处理 other 数据
      if (Array.isArray(data.typology.other) && data.typology.other.length > 0) {
          data.typology.other.forEach(({ key, value }) => {
              if (key && value) { // 确保 key 存在，并且 value 是有效数值
                  summary[key] = (summary[key] || 0) + value;
              }
          });
      }

      // 转换为字符串格式，并过滤掉 "other" 字段
      const orderedKeys = ['beds', 'lounge', 'bath', 'garage', 'level', 'carpark'];
      const orderedEntries = [];
      const otherEntries = [];
      
      Object.entries(summary).forEach(([key, value]) => {
        if (key !== 'other') { // 过滤掉 "other" 字段
          if (orderedKeys.includes(key)) {
            orderedEntries.push([key, value]);
          } else {
            otherEntries.push([key, value]);
          }
        }
      });
      
      // 按照指定顺序排序 orderedEntries
      orderedEntries.sort(([a], [b]) => orderedKeys.indexOf(a) - orderedKeys.indexOf(b));
      
      // 合并有序字段和其他字段
      const finalEntries = [...orderedEntries, ...otherEntries];
      
      return finalEntries
          .map(([key, value]) => `${value} ${key}`)
          .join(', ');
    } else {
      return '--'
    }
  }

  const formColumns = reactive([
    { title: t('楼栋号'), dataIndex: 'card_no', width: 150, align: 'center', fixed: 'left' },
    { title: t('类型'), dataIndex: 'type_name', width: 120, align: 'center', fixed: 'left' },
    { title: t('类型1'), dataIndex: 'typology', width: 280, align: 'center' },
    { title: t('面积'), dataIndex: 'sqm', width: 120, align: 'center' },
    { title: t('预计销售价格'), dataIndex: 'est_sales_price', width: 150, align: 'center' },
    { title: t('含消费税'), dataIndex: 'is_gst', width: 115, align: 'center' },
    { title: t('拆分'), dataIndex: 'is_calc', width: 130, align: 'center' },
    { title: t('担保价值'), dataIndex: 'amount', width: 150, align: 'center' },
    { title: t('保险价值'), dataIndex: 'insurance_value', width: 150, align: 'center' },
    { title: t('销售价格'), dataIndex: 'sales_price', width: 150, align: 'center' },
    { title: t('回款金额'), dataIndex: 'repayment_price', width: 150, align: 'center' },
    { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 150, align: 'center' },
    { title: t('变化比例'), dataIndex: 'variance', width: 100, align: 'center' },
    { title: t('每单位债务'), dataIndex: 'dup', width: 150, align: 'center' },
    { title: t('保险到期日'), dataIndex: 'insurance_expire_date', width: 155, align: 'center' },
    { title: t('合同日期'), dataIndex: 'contract_date', width: 155, align: 'center' },
    { title: t('结算日期'), dataIndex: 'settlement_date', width: 155, align: 'center' },
    { title: t('日落日期'), dataIndex: 'sunset_date', width: 155, align: 'center' },
    { title: t('还款日期'), dataIndex: 'repayment_date', width: 155, align: 'center' }
  ])

  const summaryCol = ref([])
  for (let i = 0; i < formColumns.length; i++) {
    summaryCol.value.push({
      key: formColumns[i].dataIndex
    })
  }

  const formDataSource = ref([])

  const getSecuritesData = async () => {
    let data = []
    if (props.type === 'requests') { // 进件流程
      await projectAuditSecurityList({ uuid: uuid.value}).then(res => {
        data = res.list || []
      })
    } else if (props.type === 'details') {
      await projectDetailAuditSecurityList({ uuid: uuid.value}).then(res => {
        data = res.list || []
      })
    } else if (props.type === 'open') {
      await dischargeSecurity({ uuid: uuid.value, page: 1, limit: 10000}).then(res => {
        data = res.data || []
      })
    }

    formDataSource.value = data
  }
  
  const pageLoading = ref(false)
  const dataInfo = ref()

  const getDataInfo = async () => {
    pageLoading.value = true
    await projectDetailApi({
      uuid: uuid.value
    }).then(async (res) => {
      if (res) {
        dataInfo.value = res
      }
      
      await getSecuritesData()
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
    })
  }

  onMounted(async () => {
    if (props.type) {
      await getDataInfo()
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

.form-block-content {
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
      border-right: 1px solid #272727;
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
  }
}
</style>
