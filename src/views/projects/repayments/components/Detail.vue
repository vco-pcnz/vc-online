<template>
  <div class="color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px">{{ t('详情') }}</div>

  <div class="detail">
    <a-alert
      v-if="Boolean(detail?.cancel_reason)"
      message="Push back reason"
      :description="detail?.cancel_reason"
      type="error"
      class="cancel-reason"
    />

    <div class="my-3" style="padding-left: 5px">
      <div class="bold fs_xl">{{ detail?.name }}</div>
      <div class="color_grey fs_xs mt-2">{{ detail?.note }}</div>
    </div>

    <div class="flex items-center box mt-4">
      <i class="iconfont left-icon mr-3">&#xe757;</i>
      <div>
        <div class="flex">
          <vco-number :value="detail?.amount" :precision="2" :bold="true" size="fs_2xl"></vco-number>
          <span class="unit">nzd</span>
          <DrawdownAmount :uuid="uuid" :detail="detail" @change="update">
            <i v-if="detail?.has_permission && detail?.mark === 'repayment_lm'" class="iconfont edit">&#xe8cf;</i>
          </DrawdownAmount>
        </div>
        <p class="bold color_grey fs_2xs">{{ t('申请金额' )}}: {{ tool.formatMoney(detail?.apply_amount) }}</p>
      </div>
    </div>

    <!-- <div v-if="detail?.prev_permission && ['repayment_lm', 'REPAYMENT CONFIRM'].includes(detail?.mark)"  class="mt-10">
      <a-popconfirm :title="t('您确实要撤回该请求吗？')" @confirm="recall">
        <a-button type="dark" class="big uppercase" :loading="accept_loading" style="width: 100%">{{ t('撤回申请') }}</a-button>
      </a-popconfirm>
    </div> -->
    
    <div v-if="detail?.prev_permission"  class="mt-10">
      <a-popconfirm :title="t('您确实要撤回该请求吗？')" @confirm="recall">
        <a-button type="dark" class="big uppercase" :loading="accept_loading" style="width: 100%">{{ t('撤回申请') }}</a-button>
      </a-popconfirm>
    </div>

    <div v-if="detail?.has_permission" class="mt-10">
      <DrawdownFCDate v-if="detail?.mark === 'repayment_fc'" :uuid="uuid" :detail="detail" :projectDetail="projectDetail" @change="update">
        <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('接受请求') }}</a-button>
      </DrawdownFCDate>
      <a-popconfirm v-else :title="t('您确定要接受该请求吗？')" @confirm="accept">
        <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('接受请求') }}</a-button>
      </a-popconfirm>

      <div class="mt-4">
        <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来拒绝还款请求。') }}</p>
        <div class="flex justify-center">
          <a-popconfirm :title="t('确定要拒绝该请求吗？')" @confirm="decline">
            <a-button type="danger" size="small" shape="round">{{ t('拒绝请求') }}</a-button>
          </a-popconfirm>
        </div>
      </div>

      <DrawdownBack v-if="detail?.mark === 'repayment_fc'" :uuid="uuid" :detail="detail" @change="update"></DrawdownBack>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import DrawdownAmount from './form/DrawdownAmount.vue';
import DrawdownBack from './form/DrawdownBack.vue';
import DrawdownFCDate from './form/DrawdownFCDate.vue';
import { forecastDarwdown, loanDsel, loanRdeclinel, loanRsaveStep, loanRrecall } from '@/api/project/loan';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: String
  },
  detail: {
    type: Object
  },
  projectDetail: {
    type: Object
  }
});
const loading = ref(false);
const accept_loading = ref(false);
const decline_loading = ref(false);
const visible = ref(false);
const forecastList = ref();

const loadData = () => {
  loading.value = true;
  forecastDarwdown({ uuid: props.uuid })
    .then((res) => {
      forecastList.value = res;
    })
    .finally((_) => {
      loading.value = false;
    });
};

// lm选择darwdown
const chooseforecast = (val) => {
  loanDsel({ uuid: props.uuid, id: props.detail?.id, forecast_id: val.id }).then((res) => {
    update();
    loadData();
  });
};

// 拒绝
const decline = async () => {
  await loanRdeclinel({ uuid: props.uuid, id: props.detail?.id })
    .then(() => {
      update();
    })
};

// 同意
const accept = async () => {
  await loanRsaveStep({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
    })
};

// 召回
const recall = async () => {
  await loanRrecall({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
    })
};

const update = () => {
  emits('update');
};

onMounted(() => {
  loadData();
});
watch(
  () => props.detail,
  (val) => {
    if (val) {
    }
  }
);
// 暴露方法给父组件
defineExpose({
  loadData
});
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.detail {
  border: 1px solid #e2e5e2;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
  border-radius: 12px;
  padding: 30px;
  min-height: 340px;

  .title {
    background-color: #b4f1db;
    color: #272727;
    border-radius: 37.4px;
    display: inline-flex;
    justify-content: center;
    font-size: 14px;
    font-weight: 500;
    gap: 6.8px;
    letter-spacing: 1px;
    padding: 8px 20.4px;
    text-transform: uppercase;
    white-space: nowrap;
    .iconfont {
      font-size: 14px;
      color: #272727;
    }
  }

  .box {
    .left-icon {
      font-size: 30px;
    }
    &.frist {
      color: #7dc1c1;
    }
    .unit {
      font-size: 20px;
      margin-left: 10px;
    }

    .edit {
      color: #d8b480;
      font-size: 16px;
      cursor: pointer;
      font-weight: bold;
      position: relative;
      right: -5px;
      top: 3px;
    }

    .dropdown-icon {
      cursor: pointer;
      font-size: 8px;
      position: relative;
      right: -6px;
      top: 10px;
    }
  }
}

.list {
  border-radius: 8px;
  box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  background: #fff;
  padding: 20px 0;

  max-height: 380px;
  overflow-y: auto;
  padding-bottom: 8px;
  padding-top: 8px;
  .list-item {
    display: flex;
    line-height: 1.5;
    transition: background-color 0.1s cubic-bezier(0.215, 0.61, 0.355, 1);
    align-items: center;
    gap: 20px;
    justify-content: space-between;
    padding: 8px 20px;
    cursor: pointer;
    &:hover {
      background-color: rgba(227, 235, 235, 0.4);
    }
  }
}

.cancel-reason {
  padding: 10px !important;
  :deep(.ant-alert-message) {
    color: #c1430c !important;
  }
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}
</style>
