<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="progress-payment-content">
        fdsafdsa
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

  // 建筑放款额
  const buildAmount = ref(0)
  // 是否为进件阶段
  const isRequests = ref(false)

   // 已设置数据
  const setedData = ref({
    row: {},
    column: {},
    data: {},
    payment: {},
    summary: {}
  })
  const hasData = ref(false)

  const setTableData = () => {
    console.log('fdsafdsa', );
  }

  // 请求已设置数据
  const getSetedData = async () => {
    const params = {
      uuid: uuid.value
    }

    try {
      if (isRequests.value) {
        await projectAuditStepDetail(params).then(res => {
          const data = res.data || []
          if (Object.keys(data)) {
            setedData.value = res
            hasData.value = true
          } else {
            pageLoading.value = false
          }
        })
      } else {
        await projectDetail(params).then(res => {
          console.log('res', res);
        })
      }
    } catch (err) {
      pageLoading.value = false
    }

    if (hasData.value) {
      setTableData()
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
