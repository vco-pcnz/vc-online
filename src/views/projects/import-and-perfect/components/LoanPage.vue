<template>
  <div class="block-container">
    <basic-info></basic-info>

    <div class="block-item mt-10">
      <vco-process-title :title="t('开发成本')"></vco-process-title>
      <DevCostDetail
        v-model:value="devCost"
        v-model:dataJson="devCostDetail"
        :loan-amount="5000000"
        @change="devCostChange"
      >
        <div class="dev-cost">
          <vco-number class="float-left" v-model:value="devCost" :precision="2" :end="true"></vco-number>
          <a-button class="float-left" type="link">
            <i class="iconfont">&#xe753;</i>
          </a-button>
        </div>
      </DevCostDetail>
    </div>

    <div class="block-item mt-10">
      <vco-process-title :title="t('抵押物信息')">
        <div class="flex gap-5 items-center">
          <a-button
            v-if="Number(securityInfo.units)"
            type="brown"
            shape="round"
            class="uppercase"
            @click="securityBatcheHandle(true)"
          >
            {{ t('批量编辑') }}
          </a-button>
          <a-button
            v-else
            type="primary"
            shape="round"
            class="uppercase"
            @click="securityBatcheHandle(false)"
          >{{ t('批量添加') }}</a-button>
        </div>
      </vco-process-title>
      <a-row :gutter="24">
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('抵押物价值') }}</p>
            <p class="txt">
              <vco-number :value="securityInfo.securityValue" :precision="2" :end="true"></vco-number>
            </p>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('保险价值') }}</p>
            <p class="txt">
              <vco-number :value="securityInfo.insuranceValue" :precision="2" :end="true"></vco-number>
            </p>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('楼栋数') }}</p>
            <p class="txt">{{ securityInfo.units }}</p>
          </div>
        </a-col>
      </a-row>
    </div>

    <div class="block-item mt-10">
      <vco-process-title :title="t('进度付款')">
        <a-button
          type="primary"
          shape="round"
          class="uppercase"
          @click="navigationTo(`/projects/import-and-perfect/progress-payment?uuid=${currentId}`)"
        >
          {{ t('编辑') }}
        </a-button>
      </vco-process-title>
      <progress-view-content :is-block="true" class="mt-10"></progress-view-content>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BasicInfo from './BasicInfo.vue';
import DevCostDetail from './DevCostDetail.vue'
import ProgressViewContent from './ProgressViewContent.vue';
import { navigationTo } from '@/utils/tool'

const { t } = useI18n();
const props = defineProps({
  currentId: {
    type: [String, Number]
  },
  projectDetail: {
    type: Object
  }
});

const devCost = ref(0)
const devCostDetail = ''
const devCostChange = (data) => {
  console.log('data', data);
}

const securityInfo = ref({
  securityValue: 0,
  insuranceValue: 0,
  units: 0,
})

const securityBatcheHandle = (flag) => {
  let query = `?uuid=${props.currentId}`
  if (flag) {
    query = `${query}&e=1`
  }
  navigationTo(`/projects/import-and-perfect/security-batche${query}`)
}
</script>

<style scoped lang="less">
@import '@/styles/variables.less';

.dev-cost {
  overflow: hidden;
  margin-top: 15px;
  display: inline-block;
  :deep(.ant-statistic) {
    height: 38px;
    display: flex;
    align-items: center;
  }
  .ant-btn {
    height: 38px;
    margin-left: 10px;
  }
}

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
</style>
