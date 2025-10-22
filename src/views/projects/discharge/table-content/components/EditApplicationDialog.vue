<template>
  <div>
    <edit-reject-dialog v-model:visible="rejectVisible" :p_uuid="uuid" :id="infoData?.id" @done="handleDone" />
    <a-modal
      :open="visible"
      :title="t('审核抵押物编辑申请')"
      :width="950"
      :footer="null"
      :keyboard="false"
      :maskClosable="false"
      @cancel="updateVisible(false)"
    >
      <div class="project-content">
        <a-row :gutter="24">
          <a-col :span="18" class="item-txt">
            <p class="name">{{ t('名称') }}</p>
            <div class="txt">
              <p>{{ newData?.security_name }}</p>
              <p class="old">{{ oldData?.security_name || '--' }}</p>
            </div>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('类型') }}</p>
            <div class="txt">
              <p>{{ newData?.type_name }}</p>
              <p class="old">{{ oldData?.type_name || '--' }}</p>
            </div>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('抵押物价值') }}</p>
            <vco-number :value="newData?.amount" :precision="2"></vco-number>
            <vco-number :value="oldData?.amount" :precision="2" class="old"></vco-number>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('保险价值') }}</p>
            <vco-number :value="newData?.insurance_value" :precision="2"></vco-number>
            <vco-number :value="oldData?.insurance_value" :precision="2" class="old"></vco-number>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('产权编号') }}</p>
            <div class="txt">
              <p>{{ newData?.card_no }}</p>
              <p class="old">{{ oldData?.card_no }}</p>
            </div>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('抵押登记日期') }}</p>
            <div class="txt">
              <p>{{ newData?.mortgage_registration_date ? tool.showDate(newData?.mortgage_registration_date) : '--' }}</p>
              <p class="old">{{ oldData?.mortgage_registration_date ? tool.showDate(oldData?.mortgage_registration_date) : '--' }}</p>
            </div>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('保险到期日') }}</p>
            <div class="txt">
              <p>{{ newData?.insurance_expire_date ? tool.showDate(newData?.insurance_expire_date) : '--' }}</p>
              <p class="old">{{ oldData?.insurance_expire_date ? tool.showDate(oldData?.insurance_expire_date) : '--' }}</p>
            </div>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('担保公司') }}</p>
            <div class="txt">
              <p>{{ newData?.insurance_company || '--' }}</p>
              <p class="old">{{ oldData?.insurance_company || '--' }}</p>
            </div>
          </a-col>
          <a-col :span="24" class="item-txt">
            <p class="name">{{ t('地址') }}</p>
            <div class="txt">
              <p>{{ newData?.city || '--' }}</p>
              <p class="old">{{ oldData?.city || '--' }}</p>
            </div>
          </a-col>
          <a-col :span="24" class="item-txt">
            <p class="name">{{ t('备注') }}</p>
            <div class="txt">
              <p>{{ newData?.remark || '--' }}</p>
              <p class="old">{{ oldData?.remark || '--' }}</p>
            </div>
          </a-col>
          <a-col v-if="Number(newData?.is_sales || 0) === 1" :span="24" class="item-txt">
            <p class="name">{{ t('预售信息') }}</p>
            <div class="info-content">
              <a-row :gutter="24">
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('含消费税') }}</p>
                  <div class="txt">
                    <p v-if="Number(newData?.is_gst) === 1">{{ t('包含') }}</p>
                    <p v-else>{{ t('不包含') }}</p>
                    <p v-if="Number(oldData?.is_gst) === 1" class="old">{{ t('包含') }}</p>
                    <p v-else class="old">{{ t('不包含') }}</p>
                  </div>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('销售价格') }}</p>
                  <vco-number :value="newData?.sales_price" :precision="2"></vco-number>
                  <vco-number :value="oldData?.sales_price" :precision="2" class="old"></vco-number>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('回款金额') }}</p>
                  <vco-number :value="newData?.repayment_price" :precision="2"></vco-number>
                  <vco-number :value="oldData?.repayment_price" :precision="2" class="old"></vco-number>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('合同日期') }}</p>
                  <div class="txt">
                    <p>{{ newData?.contract_date ? tool.showDate(newData?.contract_date) : '--' }}</p>
                    <p class="old">{{ oldData?.contract_date ? tool.showDate(newData?.contract_date) : '--' }}</p>
                  </div>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('结算日期') }}</p>
                  <div class="txt">
                    <p>{{ newData?.settlement_date ? tool.showDate(newData?.settlement_date) : '--' }}</p>
                    <p class="old">{{ oldData?.settlement_date ? tool.showDate(newData?.settlement_date) : '--' }}</p>
                  </div>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('日落日期') }}</p>
                  <div class="txt">
                    <p>{{ newData?.sunset_date ? tool.showDate(newData?.sunset_date) : '--' }}</p>
                    <p class="old">{{ oldData?.sunset_date ? tool.showDate(newData?.sunset_date) : '--' }}</p>
                  </div>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('还款日期') }}</p>
                  <div class="txt">
                    <p>{{ newData?.repayment_date ? tool.showDate(newData?.repayment_date) : '--' }}</p>
                    <p class="old">{{ oldData?.repayment_date ? tool.showDate(newData?.repayment_date) : '--' }}</p>
                  </div>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('净收益') }}</p>
                  <vco-number :value="newData?.net_proceeds_price" :precision="2"></vco-number>
                  <vco-number :value="oldData?.net_proceeds_price" :precision="2" class="old"></vco-number>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('变化比例') }}</p>
                  <vco-number :value="newData?.variance" :precision="2" suffix="%" prefix=""></vco-number>
                  <vco-number :value="oldData?.variance" :precision="2" class="old"></vco-number>
                </a-col>
              </a-row>
            </div>
          </a-col>
        </a-row>
      </div>

      <div class="mt-10 mb-5">
        <div class="flex justify-end gap-5">
          <a-button type="grey" class="big shadow bold uppercase" @click="updateVisible(false)">{{ t('关闭') }}</a-button>
          <a-popconfirm :title="t('您确定要接受该请求吗？')" @confirm="accept">
            <a-button type="dark" class="big shadow bold uppercase">{{ t('审核') }}</a-button>
          </a-popconfirm>
        </div>

        <div class="flex flex-col justify-end items-end">
          <p class="color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来拒绝请求。') }}</p>
          <div class="flex justify-center">
            <a-button type="danger" size="small" shape="round" @click="rejectVisible = true">{{ t('拒绝请求') }}</a-button>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { dischargeSaveEStep } from '@/api/project/loan';
import EditRejectDialog from './EditRejectDialog.vue';

const emits = defineEmits(['update:visible', 'done']);
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  uuid: {
    type: String,
    default: ''
  },
  infoData: {
    type: Object,
    default: () => {}
  }
});

const { t } = useI18n();

/* 更新visible */
const updateVisible = (value) => {
  emits('update:visible', value);
};

const newData = computed(() => {
  return props.infoData?.data
})

const oldData = computed(() => {
  return props.infoData?.data?.old__data
})

const handleDone = () => {
  updateVisible(false)
  emits('done')
}

const accept = async () => {
  await dischargeSaveEStep({ uuid: props.uuid, id: props.infoData?.id })
    .then(() => {
      handleDone()
      return true;
    })
    .catch(() => {
      return false;
    });
};

const rejectVisible = ref(false)
</script>

<style lang="less" scoped>
.project-content {
  position: relative;
  margin-top: 20px;
  .item-txt {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
    .name {
      color: #999;
      font-size: 13px;
      margin-bottom: 3px;
    }
    .txt {
      font-size: 18px;
      font-weight: 500;
      color: #181818;
      > .old {
        font-size: 12px;
        font-weight: normal;
        color: #999;
      }
    }
    .txt-box {
      display: flex;
      align-items: center;
      gap: 2px;
      &.line-info-box {
        gap: 15px;
      }
    }
    :deep(.ant-statistic-content) {
      font-size: 18px !important;
      font-weight: 500 !important;
    }
    :deep(.old .ant-statistic-content) {
      font-size: 12px !important;
      font-weight: normal !important;
      color: #999 !important;
    }
    > .content {
      margin-top: 10px;
      display: flex;
      flex-wrap: wrap;
      gap: 25px;
      .item {
        display: flex;
        align-items: center;
        gap: 3px;
        font-size: 16px;
        .number {
          :deep(.ant-statistic-content) {
            font-size: 16px !important;
            line-height: 1 !important;
          }
        }
      }
    }
    > .info-content {
      background-color: #f0f0f0;
      border: 1px solid #282828;
      border-radius: 10px;
      padding: 10px 15px;
      margin-top: 10px;
    }
  }
}
</style>