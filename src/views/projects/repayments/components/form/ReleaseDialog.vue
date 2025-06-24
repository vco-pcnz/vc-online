<template>
  <a-modal
    :open="visible"
    :title="t('抵押物解押')"
    :width="800"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <!-- 抵押物选择弹窗 -->
    <securities-dialog
      v-model:visible="securitiesVisible"
      :uuid="uuid"
      :select-data="relatedData"
      @done="securitiesDone"
    ></securities-dialog>

    <a-row v-if="detailData && detailData?.id" :gutter="24" class="detail-content">
      <a-col :span="12" class="item-txt">
        <p>{{ t('还款标题') }}</p>
        <p>{{ detailData.name || '--' }}</p>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('还款方式') }}</p>
        <p>{{ detailData.all_repayment ? t('全额还款') : t('部分还款') }}</p>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('还款日期') }}</p>
        <p>{{ tool.showDate(detailData.apply_date) }}</p>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('还款金额') }}</p>
        <vco-number :value="detailData.apply_amount" :precision="2"></vco-number>
      </a-col>
      <template v-if="reductionAmount">
        <a-col :span="12" class="item-txt">
          <p>{{ t('罚息减免最大额度') }}</p>
          <vco-number :value="reductionAmount" :precision="2"></vco-number>
        </a-col>
        <a-col :span="12" class="item-txt">
          <p>{{ t('罚息减免') }}</p>
          <vco-number :value="detailData.reduction_money" :precision="2" color="#31bd65"></vco-number>
        </a-col>
      </template>
    </a-row>
    <a-row v-if="detailData && detailData?.id" :gutter="24">
      <div class="w-full flex justify-between items-center mt-5">
        <p style="font-size: 12px;">{{ t('关联抵押物') }}</p>
        <a-button type="brown" shape="round" size="small" @click="securitiesVisible = true"> {{ t('选择') }}</a-button>
      </div>
      <div class="table-content sys-table-content related-content no-top-line">
        <a-table
          rowKey="uuid"
          :columns="relatedColumns"
          :data-source="relatedData"
          :pagination="false"
          table-layout="fixed"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'security_name'">
              <p :title="record.security_name" class="sec-name">{{ record.security_name }}</p>
            </template>
            <template v-if="column.dataIndex === 'amount'">
              <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
            </template>
            <template v-if="column.dataIndex === 'real_amount'">
              <a-input-number
                v-model:value="record.real_amount"
                :max="99999999999"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                class="mini"
              />
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-popconfirm
                v-if="itemInData(record.uuid)"
                :title="t('确定删除吗？')"
                @confirm="removeItems(index, record)"
              >
                <i class="iconfont remove-icon">&#xe8c1;</i>
              </a-popconfirm>

              <i v-else class="iconfont remove-icon" @click="removeItems(index)">&#xe8c1;</i>
            </template>
          </template>
        </a-table>
      </div>
    </a-row>

    <div class="mt-10 mb-5">
      <div class="flex justify-end gap-5">
        <a-button
          type="brown" class="big shadow bold uppercase mb-5 mt-5"
          @click="updateVisible(false)"
        >{{ t('关闭') }}</a-button>

        <a-popconfirm :title="t('您确定解押{0}个抵押物吗？', [relatedData.length])" @confirm="accept">
          <a-button
            type="dark" class="big shadow bold uppercase mb-5 mt-5"
          >{{ t('确定解押') }}</a-button>
        </a-popconfirm>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, reactive } from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash"
  import tool, { removeDuplicates } from '@/utils/tool';
  import { projectLoanAllRepayment, loanDelSecurity, loanDisSecurity } from '@/api/project/loan';
  import SecuritiesDialog from './SecuritiesDialog.vue';

  const emits = defineEmits(['update:visible', 'done'])

  const props = defineProps({
    visible: {
      type: Boolean,
      default: false
    },
    uuid: {
      type: String,
      default: ''
    },
    detailData: {
      type: Object,
      default: () => {}
    }
  });

  const { t } = useI18n();

  /* 更新visible */
  const updateVisible = (value) => {
    emits('update:visible', value);
  };

  const doneHandle = () => {
    updateVisible(false)
    emits('done')
  }

  const reductionAmount = ref(0)
  const calAmount = () => {
    const time = props.detailData.apply_date
    projectLoanAllRepayment({
      uuid: props.uuid,
      date: time
    })
      .then((res) => {
        reductionAmount.value = Number(res.reduction_money) ? Number(res.reduction_money) : 0
      })
  };

  const relatedColumns = reactive([
    { title: t('名称'), dataIndex: 'security_name', width: 140 },
    { title: t('产权编号'), dataIndex: 'card_no', width: 100 },
    { title: t('类型'), dataIndex: 'type_name', width: 90 },
    { title: t('抵押物价值'), dataIndex: 'amount', width: 150 },
    { title: t('当前抵押物价值'), dataIndex: 'real_amount', width: 170 },
    { title: t('操作1'), dataIndex: 'operation', fixed: 'right', align: 'center', width: 50}
  ]);

  const subLoading = ref(false)
  // 同意
  const accept = async () => {
    subLoading.value = true
    const params = {
      uuid: props.uuid,
      id: props.detailData?.id,
      security: []
    }
    if (relatedData.value.length) {
      const security = relatedData.value.map(item => {
        return {
          uuid: item.uuid,
          real_amount: item.real_amount
        }
      })
      params.security = security
    }
    await loanDisSecurity(params).then(() => {
      doneHandle()
      subLoading.value = false
      return true;
    }).catch(() => {
      subLoading.value = false
      return false;
    })
  };

  const securitiesVisible = ref(false)
  const relatedData = ref([])
  const securitiesDone = (data) => {
    const arr = cloneDeep(data)
    const selected = Array.from(new Set([...relatedData.value, ...arr]));
    const selData = removeDuplicates(selected, 'uuid')
    selData.forEach(item => {
      item.real_amount = Number(item.real_amount) ? item.real_amount : item.amount
    })

    relatedData.value = selData
  }

  const relatedStaticData = ref([])
  const itemInData = (uuid) => {
    const obj = relatedStaticData.value.find(item => item.uuid === uuid)
    return obj ? true : false
  }

  const removeItems = async (index, data) => {
    if (data) {
    const params = {
      uuid: props.uuid,
      ids: [data.uuid]
    }

    await loanDelSecurity(params).then(() => {
      relatedData.value.splice(index, 1)
      const _index = relatedStaticData.value.findIndex(item => item.uuid === data.uuid)
      if (_index > -1) {
        relatedStaticData.value.splice(_index, 1)
      }
      return true
    }).catch(() => {
      return false
    })
  } else {
    relatedData.value.splice(index, 1)
  }
  }

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (Number(props.detailData.all_repayment)) {
          calAmount();
        }
        if (props.detailData.security && props.detailData.security.length) {
          relatedData.value = cloneDeep(props.detailData.security)
          relatedStaticData.value = cloneDeep(props.detailData.security)
        }
      } else {
        subLoading.value = false
        relatedData.value = []
        relatedStaticData.value = []
      }
    }
  )
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.detail-content {
  background-color: #f5f5f5;
  padding-bottom: 15px;
  border-radius: 10px;
  margin-top: 15px;
}
.item-txt {
  margin-top: 15px;
  &.no {
    margin-top: 0;
  }
  &.total {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  > p {
    font-size: 13px;
    &:first-child {
      color: #999;
    }
    &:last-child {
      font-size: 14px;
      word-break: break-all;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 14px !important;
  }
}

.change-content {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-top: 5px;
  > p {
    font-size: 14px;
    &:first-child {
      color: #888;
    }
  }
  > i {
    font-size: 13px;
  }
}

.change-info {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  > p {
    font-size: 14px;
    color: #888;
    &:last-child {
      font-size: 12px;
    }
  }
}

.change-amount {
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.total-amount {
  position: relative;
  > p {
    font-size: 11px;
    color: #888;
    line-height: 1;
    position: absolute;
  }
}

.cancel-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}

.info-content {
  margin-top: 10px;
  .name {
    font-size: 12px;
    color: #666;
  }
  .txt {
    font-size: 13px;
    font-weight: 500;
    :deep(.ant-statistic-content) {
      font-size: 16px !important;
    }
  }
}
.color_coal {
  color: @colorPrimary;
  font-size: 14px;
}

.related-content {
  padding: 10px;
  border: 1px solid #272727 !important;
  border-radius: 10px !important;
  margin-top: 10px;
  :deep(.ant-empty) {
    min-height: 50px !important;
    margin: 0 !important;
  }
  :deep(.remove-icon) {
    cursor: pointer;
    color: #ea3535 !important;
    &:hover {
      color: #f24f4f !important;
    }
  }
}
</style>