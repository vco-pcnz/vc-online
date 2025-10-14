<template>
  <a-modal
    :open="visible"
    :title="t('还款详情')"
    :width="730"
    :footer="null"
    :keyboard="false"
    :maskClosable="false"
    @cancel="updateVisible(false)"
  >
    <a-row v-if="detailData && detailData?.id" :gutter="24">
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
      <template v-if="detailData.all_repayment">
        <a-col v-if="detailData.reduction_rate" :span="9" class="item-txt">
          <p>{{ t('建议标准税率') }} <span v-if="detailData.reduction_rate_old" class="pl-2">{{ `(${t('最小值')}: ${detailData.reduction_rate_old}%)` }}</span></p>
          <vco-number :value="detailData.reduction_rate" prefix="" suffix="%" :precision="2" ></vco-number>
        </a-col>
        <a-col v-if="detailData.reduction_money" :span="9" class="item-txt">
          <p>{{ t('减免额度') }} <span v-if="detailData.reduction_money_old" class="pl-2">{{ `(${t('最大值')}: $${numberStrFormat(detailData.reduction_money_old)})` }}</span></p>
          <vco-number :value="detailData.reduction_money" :precision="2" ></vco-number>
        </a-col>
        <a-col :span="6" class="item-txt">
          <p>Loan IRR <span v-if="detailData.reduction_irr_old" class="pl-2">{{ `(${numberStrFormat(detailData.reduction_irr_old)}%)` }}</span></p>
          <vco-number :value="detailData.reduction_irr" prefix="" suffix="%" :precision="2" ></vco-number>
        </a-col>
      </template>
      <a-col :span="24" class="item-txt">
        <p>{{ t('还款说明') }}</p>
        <p>{{ detailData.note || '--' }}</p>
      </a-col>
      <a-col :span="24" v-if="detailData.all_repayment && extraData" class="mt-2">
        <extra-item v-model="extraData" :repayment-amount="extraRepaymentAmount" :is-details="true"></extra-item>
      </a-col>
      <a-col :span="24" v-if="detailData.security && detailData.security.length" class="item-txt">
        <p>{{ t('关联抵押物') }}</p>
        <div class="table-content sys-table-content related-content mt-2">
          <a-table
            rowKey="uuid"
            :columns="relatedColumns"
            :data-source="detailData.security"
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
                <vco-number size="fs_md" :value="record.real_amount" :precision="2"></vco-number>
              </template>
            </template>
          </a-table>
        </div>
      </a-col>
    </a-row>
    <div class="mt-10 mb-5">
      <div class="flex justify-end gap-5">
        <a-button
          type="brown" class="big shadow bold uppercase mb-5 mt-5"
          @click="updateVisible(false)"
        >{{ t('关闭') }}</a-button>

        <a-popconfirm v-if="isAccept" :title="t('您确定要接受该请求吗？')" @confirm="accept">
          <a-button
            type="dark" class="big shadow bold uppercase mb-5 mt-5"
          >{{ t('接受请求') }}</a-button>
        </a-popconfirm>
      </div>
    </div>
  </a-modal>
</template>

<script setup>
  import { ref, watch, reactive, computed } from "vue";
  import { useI18n } from "vue-i18n";
  import tool, { numberStrFormat } from '@/utils/tool';
  import { projectLoanAllRepayment } from '@/api/project/loan';
  import { loanRsaveStep } from '@/api/project/loan';
  import ExtraItem from './ExtraItem.vue';

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
    },
    isAccept: {
      type: Boolean,
      default: false
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

  const extraRepaymentAmount = computed(() => {
    return tool.minus(Number(props.detailData?.apply_amount || 0), Number(props.detailData?.extra_amount || 0))
  })

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
    { title: t('当前抵押物价值'), dataIndex: 'real_amount', width: 170 }
  ]);

  const subLoading = ref(false)
  // 同意
  const accept = async () => {
    subLoading.value = true
    await loanRsaveStep({ uuid: props.uuid, id: props.detailData?.id }).then((res) => {
      doneHandle()
      subLoading.value = false
      return true;
    }).catch(() => {
      subLoading.value = false
      return false;
    })
  };

  const extraData = ref(null)

  watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (Number(props.detailData.all_repayment)) {
          if (props.detailData.extra && props.detailData.extra.length) {
            extraData.value = {
              data: props.detailData.extra,
              recovery: true
            }
          }
          calAmount();
        }
      } else {
        subLoading.value = false
      }
    }
  )
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.item-txt {
  margin-top: 25px;
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
      margin-top: 5px;
      word-break: break-all;
    }
    > span {
      color: #31bd65;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 14px !important;
    margin-top: 5px;
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
</style>