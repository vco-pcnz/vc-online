<template>
  <div class="block-item">
    <vco-process-title :title="t('基础信息')"></vco-process-title>
    <div>
      <a-row :gutter="24">
        <a-col :span="9">
          <div class="info-content">
            <p class="name">{{ t('项目名称') }}</p>
            <p class="txt">{{ projectName || '--' }}</p>
          </div>
        </a-col>
        <a-col :span="6">
          <div class="info-content">
            <p class="name">{{ t('借款金额') }}</p>
            <p class="txt">
              <vco-number :value="loanMoney" :precision="2" :end="true"></vco-number>
            </p>
          </div>
        </a-col>
        <template v-if="startDate && endDate">
          <a-col :span="4">
            <div class="info-content">
              <p class="name">{{ t('项目借款周期') }}</p>
              <p class="txt">{{ tool.showDate(startDate) + ' - ' + tool.showDate(endDate) }}</p>
            </div>
          </a-col>
          <a-col :span="3">
            <div class="info-content">
              <p class="name">{{ t('借款周期') }}</p>
              <p class="txt">{{ showTerm }}</p>
            </div>
          </a-col>
          <a-col :span="2">
            <div class="info-content">
              <p class="name">{{ t('总天数') }}</p>
              <p class="txt">{{ showTotalDay }}</p>
            </div>
          </a-col>
        </template>
        <a-col :span="9">
          <div class="info-content">
            <p class="name">{{ t('楼栋数') }}</p>
            <p class="txt">{{ buildingNum }}</p>
          </div>
        </a-col>
        <a-col :span="15">
          <div class="info-content">
            <p class="name">
              {{ t('项目地址') }}
              <EditAddr :data="projectDetail" :current-id="currentId" @reload="reload"> <i class="iconfont ml-2 edit cursor-pointer">&#xe753;</i></EditAddr>
            </p>
            <p class="txt" v-if="!projectDetail?.project_address_other || projectDetail?.project_address_other.length <= 1">{{ projectAddress || '--' }}</p>
            <template v-else>
              <p class="txt" v-for="(item, index) in projectDetail?.project_address_other" :key="index">{{ item.project_city }}</p>
            </template>
          </div>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import EditAddr from './EditAddr.vue';

const emits = defineEmits(['reload']);

const { t } = useI18n();

const props = defineProps({
  currentId: {
    type: [String, Number]
  },
  projectDetail: {
    type: Object
  }
});

const startDate = ref('');
const endDate = ref('');

const showTerm = computed(() => {
  const data = tool.calculateDurationPrecise(startDate.value, endDate.value);
  if (data.months && data.days) {
    return `${data.months} ${t('月')} ${data.days} ${t('天')}`;
  }

  if (data.months && !data.days) {
    return `${data.months} ${t('月')}`;
  }

  if (!data.months && data.days) {
    return `${data.days} ${t('天')}`;
  }

  return '--';
});

const showTotalDay = computed(() => {
  const data = tool.calculateDurationPrecise(startDate.value, endDate.value);
  return data.gapDay || 0;
});

const projectName = ref('');
const loanMoney = ref(0);
const buildingNum = ref(0);
const projectAddress = ref('');
const dataInit = () => {
  projectName.value = props.projectDetail.project_name;
  loanMoney.value = Number(props.projectDetail.loan_money);
  buildingNum.value = props.projectDetail.building_num;
  projectAddress.value = props.projectDetail.project_city;

  startDate.value = props.projectDetail.start_date;
  endDate.value = props.projectDetail.end_date;
};

const reload = () => {
  emits('reload');
};

watch(
  () => props.projectDetail,
  (val) => {
    if (val) {
      dataInit();
    }
  },
  { deep: true, immediate: true }
);
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';
.info-content {
  margin-top: 15px;
  .name {
    font-size: 12px;
    color: #666;
  }
  .txt {
    font-size: 14px;
    font-weight: 500;
    margin-top: 5px;
    :deep(.ant-statistic-content) {
      font-size: 14px !important;
    }
  }
}
.edit {
  color: @colorPrimary;
}
</style>
