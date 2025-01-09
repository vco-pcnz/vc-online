<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <vco-confirm-alert ref="sureAlertRef" :check="true" v-model:visible="sureVisible" @submit="confirmSub"></vco-confirm-alert>

      <div v-if="dataInfo && dataInfo.cancel_reason" class="block-item details process-fail mt-5">
        <p class="title">{{ t('拒绝原因') }}</p>
        <p class="info">{{ dataInfo.cancel_reason || t('拒绝原因') }}</p>
      </div>
      
      <div class="block-container">
        <div v-if="dataInfo" class="left-content">
          <!-- 基础信息 -->
          <base-info-content :step-type="5" :data-info="dataInfo" @refresh="getDataInit"></base-info-content>

          <!-- 放款信息 -->
          <credit-form
            :step-type="5"
            :current-id="currentId"
            :credit-cate="currentStep.credit_cate"
            :offer-amount="offerAmount"
            :loan-money="dataInfo.loan_info.loan_money"
            :initial-amount="initialAmount"
            :bonus-info="bonusInfo"
            @done="showForecast = true"
            @refresh="getDataInit"
          ></credit-form>

          <!-- 抵押物 -->
          <security-items :step-type="5" :current-id="currentId" :security-info="securityInfo" @refresh="getDataInit"></security-items>

          <!-- 担保信息 -->
          <guarantor-info :step-type="5" :current-id="currentId" :guarantor-info="guarantorInfo" @refresh="getDataInit"></guarantor-info>
          
          <!-- 反洗钱文件 -->
          <wash-table
            :step-type="5"
            :current-id="currentId"
            :security-info="securityInfo"
            :wash-info="washInfo"
            :wash-check="true"
            @refresh="getDataInit"
            :hide="true"
          ></wash-table>

          <temp-footer
            ref="footerRef"
            :check="check"
            :sub-loading="subLoading"
            :show-draft="false"
            :previous-page="previousPage"
            :previous-step="previousStep"
            :next-page="nextPage"
            :can-next="canNext"
            :current-id="currentId"
            :current-step="currentStep"
            :next-step="nextStep"
            @submit="submitHandle"
          ></temp-footer>
        </div>
        <div v-if="dataInfo" class="right-content">
          <bind-users :current-id="currentId" :is-details="true"></bind-users>
          <operation-log :current-id="currentId"></operation-log>
          <forecast-list v-if="showForecast" :current-id="currentId" :info-data="currentDataInfo" :is-details="true"></forecast-list>
          <security-list :current-id="currentId" :security-info="securityInfo" :is-details="true"></security-list>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';
import { projectLmAuditDetail, projectAuditLmOpen } from '@/api/process';
import BaseInfoContent from './components/BaseInfoContent.vue';
import TempFooter from './components/TempFooter.vue';
import CreditForm from './components/CreditForm.vue';
import SecurityItems from './components/SecurityItems.vue';
import GuarantorInfo from './components/GuarantorInfo.vue';
import WashTable from './components/WashTable.vue';
import BindUsers from './../../components/BindUsers.vue';
import OperationLog from './../../components/OperationLog.vue';
import ForecastList from './../../components/ForecastList.vue';
import SecurityList from './../../components/SecurityList.vue';
import emitter from '@/event';
import useProcessStore from '@/store/modules/process';
import { message } from 'ant-design-vue/es';
import { navigationTo } from '@/utils/tool';

// 初始化当前项目的forcastList 状态
const processStore = useProcessStore();
processStore.setForcastState(false);

const emits = defineEmits(['checkDone', 'dataDone']);

const props = defineProps({
  infoData: {
    type: Object,
    default: () => {}
  },
  draftData: {
    type: Object,
    default: () => {}
  },
  previousStep: {
    type: Object
  },
  currentStep: {
    type: Object
  },
  nextStep: {
    type: Object
  },
  currentId: {
    type: [Number, String],
    default: ''
  },
  check: {
    type: Boolean,
    default: false
  },
  previousPage: {
    type: String,
    default: ''
  },
  nextPage: {
    type: String,
    default: ''
  },
  canNext: {
    type: Boolean,
    default: false
  }
});

const { t } = useI18n();
const footerRef = ref();

const currentDataInfo = ref();
const showForecast = ref(false);

const subLoading = ref(false);
const sureVisible = ref(false);
const sureAlertRef = ref();
const submitHandle = () => {
  const data = currentDataInfo.value
  if (!data.borrower_info.is_check) {
    message.error(t('请审核') + t('借款人信息'))
    return false
  }
  if (!data.project_info.is_check) {
    message.error(t('请审核') + t('项目信息'))
    return false
  }
  if (!data.project_cert.is_check) {
    message.error(t('请审核') + t('证件资料'))
    return false
  }
  if (!data.loan_info.is_check) {
    message.error(t('请审核') + t('借款信息'))
    return false
  }
  if (!data.offer_amount.is_check) {
    message.error(t('请审核') + t('放款信息'))
    return false
  }
  if (!data.offer_bonus.is_check) {
    message.error(t('请审核') + t('奖金信息'))
    return false
  }
  if (!data.security.is_check) {
    message.error(t('请审核') + t('抵押物信息'))
    return false
  }
  if (!data.guarantor.is_check) {
    message.error(t('请审核') + t('担保信息'))
    return false
  }
  if (!data.wash.is_check) {
    message.error(t('请审核') + t('新增反洗钱信息'))
    return false
  }

  sureVisible.value = true;
};

const confirmSub = () => {
  const params = {
    uuid: props.currentId
  };

  projectAuditLmOpen(params)
    .then(res => {
      sureAlertRef.value.changeLoading(false);
      sureVisible.value = false;

      // 触发列表数据刷新
      emitter.emit('refreshRequestsList2');

      navigationTo('/requests/loan')
    })
    .catch(() => {
      sureAlertRef.value.changeLoading(false);
    });
};

const dataInfo = ref(null);
const offerAmount = ref(null);
const initialAmount = ref(null);
const securityInfo = ref(null);
const bonusInfo = ref(null);
const guarantorInfo = ref(null);
const washInfo = ref(null);
const dataInit = (infoMsg = {}) => {
  const data = cloneDeep({ ...infoMsg, ...props.infoData });

  offerAmount.value = data.offer_amount;
  initialAmount.value = data.initial_amount;
  securityInfo.value = data.security;
  bonusInfo.value = data.offer_bonus;
  guarantorInfo.value = data.guarantor;
  washInfo.value = data.wash;
  dataInfo.value = data;
  currentDataInfo.value = data;
  emits('dataDone', data.project_apply_sn);
};

const pageLoading = ref(false);
const getDataInit = async () => {
  pageLoading.value = true;
  let infoData = {};

  if (props.currentId) {
    await projectLmAuditDetail({
      uuid: props.currentId,
      type: 2
    }).then((res) => {
      infoData = res;
    });
  }

  pageLoading.value = false;
  dataInit(infoData);
};

watch(
  () => props.infoData,
  (val) => {
    if (val) {
      dataInit();
    }
  },
  {
    immediate: true
  }
);

onMounted(() => {
  if (!props.check) {
    getDataInit();
  }

  emitter.on('refreshSecurityInfo', () => {
    getDataInit();
  });
});
</script>

<style lang="less" scoped>
@import './styles/common.less';
.sys-form-content {
  :deep(.ant-input-number-input) {
    font-size: 18px !important;
  }
}
</style>
