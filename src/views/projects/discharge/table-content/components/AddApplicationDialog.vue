<template>
  <div>
    <add-reject-dialog v-model:visible="rejectVisible" :p_uuid="uuid" :uuid="infoData?.uuid" @done="handleDone" />
    <a-modal
      :open="visible"
      :title="t('审核抵押物新增申请')"
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
            <p class="txt">{{ infoData?.security_name }}</p>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('类型') }}</p>
            <p class="txt">{{ infoData?.type_name }}</p>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('抵押物价值') }}</p>
            <vco-number :value="infoData?.amount" :precision="2"></vco-number>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('保险价值') }}</p>
            <vco-number :value="infoData?.insurance_value" :precision="2"></vco-number>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('产权编号') }}</p>
            <p class="txt">{{ infoData?.card_no }}</p>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('抵押登记日期') }}</p>
            <p class="txt">{{ infoData?.mortgage_registration_date ? tool.showDate(infoData?.mortgage_registration_date) : '--' }}</p>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('保险到期日') }}</p>
            <p class="txt">{{ infoData?.insurance_expire_date ? tool.showDate(infoData?.insurance_expire_date) : '--' }}</p>
          </a-col>
          <a-col :span="6" class="item-txt">
            <p class="name">{{ t('担保公司') }}</p>
            <p class="txt">{{ infoData?.insurance_company || '--' }}</p>
          </a-col>
          <a-col :span="24" class="item-txt">
            <p class="name">{{ t('地址') }}</p>
            <p class="txt">{{ infoData?.city || '--' }}</p>
          </a-col>
          <a-col :span="24" class="item-txt">
            <p class="name">{{ t('备注') }}</p>
            <p class="txt">{{ infoData?.remark || '--' }}</p>
          </a-col>
          <a-col v-if="houseInfo.length" :span="24" class="item-txt">
            <p class="name">{{ t('房屋信息') }}</p>
            <div class="content">
              <div class="item">
                <vco-number :value="infoData?.sqm" :precision="2" prefix="" suffix="㎡" class="number"></vco-number>
              </div>
              <div class="item" v-for="item in houseInfo" :key="item.name">
                <vco-number :value="item.value" :precision="0" prefix="" class="number"></vco-number>
                <p class="name">{{ item.name }}</p>
              </div>
            </div>
          </a-col>
          <a-col v-if="Number(infoData?.is_sales || 0) === 1" :span="24" class="item-txt">
            <p class="name">{{ t('预售信息') }}</p>
            <div class="info-content">
              <a-row :gutter="24">
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('含消费税') }}</p>
                  <p class="txt" v-if="Number(infoData?.is_gst) === 1">{{ t('包含') }}</p>
                  <p class="txt" v-else>{{ t('不包含') }}</p>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('销售价格') }}</p>
                  <vco-number :value="infoData?.sales_price" :precision="2"></vco-number>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('回款金额') }}</p>
                  <vco-number :value="infoData?.repayment_price" :precision="2"></vco-number>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('合同日期') }}</p>
                  <p class="txt">{{ infoData?.contract_date ? tool.showDate(infoData?.contract_date) : '--' }}</p>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('结算日期') }}</p>
                  <p class="txt">{{ infoData?.settlement_date ? tool.showDate(infoData?.settlement_date) : '--' }}</p>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('日落日期') }}</p>
                  <p class="txt">{{ infoData?.sunset_date ? tool.showDate(infoData?.sunset_date) : '--' }}</p>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('还款日期') }}</p>
                  <p class="txt">{{ infoData?.repayment_date ? tool.showDate(infoData?.repayment_date) : '--' }}</p>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('净收益') }}</p>
                  <vco-number :value="infoData?.net_proceeds_price" :precision="2"></vco-number>
                </a-col>
                <a-col :span="6" class="item-txt">
                  <p class="name">{{ t('变化比例') }}</p>
                  <vco-number :value="infoData?.variance" :precision="2" suffix="%" prefix=""></vco-number>
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
import { cloneDeep } from 'lodash';
import tool from '@/utils/tool';
import { dischargeSaveDStep } from '@/api/project/loan';
import AddRejectDialog from './AddRejectDialog.vue';

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

const houseInfo = computed(() => {
  if (props.infoData && Number(props.infoData.type || 0) === 2) {
    const obj = cloneDeep(props.infoData.typology)
    const arr = []
    for (const key in obj) {
      if (key !== 'other') {
        arr.push({
          name: key,
          value: obj[key]
        })
      } else {
        if (obj.other && obj.other.length > 0) {
          obj.other.forEach(item => {
            arr.push({
              name: item.key,
              value: item.value
            })
          })
        }
      }
    }
    return arr;
  } else {
    return [];
  }
})

const handleDone = () => {
  updateVisible(false)
  emits('done')
}

const accept = async () => {
  await dischargeSaveDStep({ p_uuid: props.uuid, uuid: props.infoData?.uuid })
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
    > p {
      font-size: 13px;
      &.name {
        color: #999;
        margin-bottom: 3px;
      }
      &.txt {
        font-size: 18px;
        font-weight: 500;
        color: #181818;
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