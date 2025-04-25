
<template>
  <div class="block-container">
    <basic-info :projectDetail="projectDetail" :current-id="currentId" @reload="reload"></basic-info>

    <div class="block-item mt-10">
      <vco-process-title :title="t('开发成本')"></vco-process-title>
      <DevCostDetail
        v-model:value="devCost"
        v-model:dataJson="devCostDetail"
        :current-id="currentId"
        :loan-amount="loanMoney"
        :edit="!Boolean(projectDetail?.old.upd_dev)"
        :has-build-data="projectDetail?.has_build_data"
        @change="devCostChange"
      >
        <div class="dev-cost">
          <vco-number class="float-left" v-model:value="devCost" :precision="2" :end="true"></vco-number>
          <a-button class="float-left" type="link">
            <i v-if="Boolean(projectDetail?.old.upd_dev)" class="iconfont" style="font-size: 18px;">&#xe63e;</i>
            <i v-else class="iconfont">&#xe753;</i>
          </a-button>
        </div>
      </DevCostDetail>
    </div>

    <div class="block-item mt-10">
      <vco-process-title :title="t('抵押物信息')">
        <div class="flex gap-5 items-center">
          <a-button
            type="primary"
            shape="round"
            class="uppercase"
            @click="openSecurity(Boolean(projectDetail?.old.upd_sec))"
          >
            {{ t('批量编辑') }}
          </a-button>
        </div>
      </vco-process-title>
      <a-row :gutter="24">
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('抵押物价值') }}</p>
            <p class="txt">
              <vco-number :value="securityInfo.total_money" :precision="2" :end="true"></vco-number>
            </p>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('保险价值') }}</p>
            <p class="txt">
              <vco-number :value="securityInfo.total_value" :precision="2" :end="true"></vco-number>
            </p>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="info-content">
            <p class="name">{{ t('抵押物数量') }}</p>
            <p class="txt">{{ securityInfo.count }}</p>
          </div>
        </a-col>
      </a-row>

      <security-view v-if="Boolean(projectDetail?.old.upd_sec)" class="mt-10"></security-view>
    </div>

    <div class="block-item mt-10">
      <vco-process-title :title="t('进度付款')">
        <a-button
          type="primary"
          shape="round"
          class="uppercase"
          @click="openProgress(Boolean(projectDetail?.old.upd_build))"
        >
          {{ t('编辑') }}
        </a-button>
      </vco-process-title>
      <progress-view-content
        ref="progressViewRef"
        v-if="projectDetail?.loan_money"
        :is-block="true"
        :projectDetail="projectDetail" class="mt-10"
      ></progress-view-content>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasicInfo from './BasicInfo.vue';
import { message } from 'ant-design-vue/es';
import DevCostDetail from './DevCostDetail.vue'
import ProgressViewContent from './ProgressViewContent.vue';
import SecurityView from './SecurityView.vue';
import { navigationTo } from '@/utils/tool'
import { cloneDeep } from 'lodash'

const { t } = useI18n();
const props = defineProps({
  currentId: {
    type: [String, Number]
  },
  projectDetail: {
    type: Object,
    default: () => {}
  }
});

const emits = defineEmits(['reload'])

const devCost = ref(0)
const devCostDetail = ref([])
const loanMoney = ref(0)

const progressViewRef = ref()
const devCostChange = () => {
  emits('reload')
  progressViewRef.value.getProjectData(true)
}

const reload = () => {
  emits('reload')
}

const securityInfo = ref({
  total_money: 0,
  total_value: 0,
  count: 0,
})

const openSecurity = (flag) => {
  if (flag) {
    message.error(t('已超过编辑次数限制'))
  } else {
    const loan = props.projectDetail.devCostDetail[0].data[0].loan
    if (loan) {
      navigationTo(`/projects/import-and-perfect/security-batche?uuid=${props.currentId}`)
    } else {
      message.error(t('请先设置开发成本'))
    }
  }
}

const openProgress = (flag = false) => {
  if (flag) {
    message.error(t('已超过编辑次数限制'))
  } else {
    const count = props.projectDetail.security.count
    if (count) {
      navigationTo(`/projects/import-and-perfect/progress-payment?uuid=${props.currentId}`)
    } else {
      message.error(t('请先设置抵押物信息'))
    }
  }
}

const dataInit = () => {
  devCost.value = props.projectDetail.devCost
  devCostDetail.value = props.projectDetail.devCostDetail || []
  loanMoney.value = Number(props.projectDetail.loan_money)

  securityInfo.value = cloneDeep(props.projectDetail.security)
}

watch(
  () => props.projectDetail,
  (val) => {
    if (val) {
      dataInit()
    }
  },
  { deep: true, immediate: true }
);
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
