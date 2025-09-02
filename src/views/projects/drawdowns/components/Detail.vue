<template>
  <div class="color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px">Details</div>

  <div class="detail relative">
    <div style="position: absolute; right: 10px; top: 10px; cursor: pointer" v-if="detail?.cancellog && detail?.cancellog.length">
      <PushBackLog :data="detail?.cancellog"></PushBackLog>
    </div>
    <!-- <div class="title" :style="{ color: colors[detail?.status_name]?.color || '#272727' }">
      <p style="color: #181818" v-if="detail?.status == 2">PAID</p>
      <p v-else>{{ detail?.status_name }}</p>
    </div> -->
    <a-alert v-if="Boolean(detail?.cancel_reason)" message="Push back reason" :description="detail?.cancel_reason" type="error" class="cancel-reason" />
    <div class="my-3" style="padding-left: 5px">
      <div class="bold fs_xl">{{ detail?.name }}</div>
      <div class="color_grey fs_xs" v-if="detail?.note">{{ t('说明') }}: {{ detail?.note }}</div>
      <div class="color_grey fs_xs" v-if="detail?.remark">{{ t('消息') }}: {{ detail?.remark }}</div>
      <!-- <div>
        <span class="fs_xs color_grey">{{ t('施工进度') }}</span
        >: {{ detail.progress }}%
      </div> -->
    </div>
    <!-- <div class="flex items-center"><i class="iconfont mr-2">&#xe774;</i><span class="weight_demiBold">Documents & photos</span></div>
      <p class="color_grey mt-1 mb-3">1 file had been provided: drawdown notice</p> -->
    <a-button type="brown" v-if="detail?.annex_id" shape="round" size="small" @click="navigationTo(`${mode}/projects/documents?uuid=` + uuid + '&annex_id=' + detail?.annex_id)">{{ t('查看文件') }}</a-button>

    <div class="flex items-center box mt-5">
      <i class="iconfont left-icon mr-3">&#xe755;</i>
      <div>
        <div class="flex">
          <vco-number :value="detail?.amount" :precision="2" :bold="true" size="fs_2xl"></vco-number>
          <span class="unit">nzd</span>
          <!-- <DrawdownAmount :uuid="uuid" :detail="detail" :projectDetail="projectDetail" @change="update" v-if="detail?.mark === 'drawdown_lm' && hasPermission('projects:drawdowns:edit')"><i class="iconfont edit">&#xe8cf;</i></DrawdownAmount> -->
          <DrawdownRequest :uuid="uuid" :detail="detail" :projectDetail="projectDetail" @change="update" v-if="detail?.mark === 'drawdown_lm' && hasPermission('projects:drawdowns:edit')"><i class="iconfont edit">&#xe8cf;</i></DrawdownRequest>

          <DrawdownAmount v-else-if="!hasPermission('projects:drawdowns:add')" :uuid="uuid" :detail="detail" :projectDetail="projectDetail" :isEdit="false" @change="update"><i class="iconfont edit">&#xe776;</i></DrawdownAmount>
        </div>
        <p class="bold color_grey fs_2xs">{{ t('申请金额') }}: {{ detail?.apply_amount > 0 ? tool.formatMoney(detail?.apply_amount) : tool.formatMoney(detail?.vip_amount) }}</p>
      </div>
    </div>
    <div class="flex items-center box frist mt-2">
      <i class="iconfont left-icon mr-3">&#xe78d;</i>
      <div>
        <div class="flex">
          <template v-if="detail?.forecast">
            <vco-number color="#7dc1c1" :value="detail?.forecast.amount" :precision="2" :bold="true" size="fs_2xl"></vco-number>
            <span class="unit">nzd</span>
          </template>
          <template v-else>
            <p class="fs_2xl bold">without reference</p>
          </template>

          <a-dropdown class="Filter" trigger="click" v-model:open="visible" v-if="detail?.has_permission && detail?.mark === 'drawdown_lm'">
            <i class="iconfont dropdown-icon">&#xe778;</i>
            <template #overlay>
              <a-spin :spinning="loading" size="large">
                <ul class="list">
                  <li class="list-item" v-for="item in forecastList" :key="item" @click="chooseforecast(item)">
                    <div>
                      {{ item.name }} <span class="ml-3">{{ tool.showDate(item.date) }}</span>
                    </div>

                    <vco-number color="#7dc1c1" :value="item.amount" :precision="2" :bold="true" size="fs_md"></vco-number>
                  </li>
                  <li class="list-item" @click="chooseforecast({ id: 0 })">without reference</li>
                </ul>
              </a-spin>
            </template>
          </a-dropdown>
        </div>
        <template v-if="detail?.forecast">
          <p class="bold color_grey fs_2xs">{{ t('预估金额') }}, {{ tool.showDate(detail?.forecast.date) }}</p>
        </template>
        <template v-else>
          <p class="bold color_grey fs_2xs">{{ t('这次放款数据没有预测') }}</p>
        </template>
      </div>
    </div>
    <div class="mt-3">
      <!-- 撤回 -->
      <a-popconfirm :title="t('您确实要撤回该请求吗？')" @confirm="recall" v-if="detail?.prev_permission">
        <template #icon>
          <CheckCircleOutlined :style="{ color: '#a9ad57' }" />
        </template>
        <a-button type="dark" class="big uppercase mb-3" :loading="accept_loading" style="width: 100%"> {{ t('撤回申请') }} </a-button>
      </a-popconfirm>

      <!-- 审核 -->
      <template v-if="detail?.has_permission">
        <AcceptFc v-if="detail?.mark === 'drawdown_fc'" :uuid="uuid" :detail="detail" :projectDetail="projectDetail" @change="update">
          <a-button type="dark" class="big uppercase" style="width: 100%" :loading="accept_loading"> {{ t('接受请求') }} </a-button>
        </AcceptFc>
        <a-button v-else-if="detail?.mark === 'drawdown_lm'" type="dark" class="big uppercase" style="width: 100%" @click="visible_tip = true">{{ t('接受请求') }}</a-button>
        <!-- 对账 -->
        <ReconciliationModal v-else-if="detail?.mark === 'drawdown_lm_recon'" :detail="detail" :uuid="uuid" :type="1" @update="update">
          <a-button type="cyan" class="big uppercase" style="width: 100%"> {{ t('对账') }} </a-button>
        </ReconciliationModal>

        <a-popconfirm v-else :title="t('您确定要接受该请求吗？')" @confirm="accept">
          <template #icon>
            <CheckCircleOutlined :style="{ color: '#a9ad57' }" />
          </template>
          <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('接受请求') }}</a-button>
        </a-popconfirm>
      </template>
    </div>
    <template v-if="detail?.has_permission && (detail?.mark == 'drawdown_lm' || detail?.mark == 'drawdown_fc' || detail?.mark == 'drawdown_director')">
      <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来拒绝放款请求。') }}</p>
      <div class="flex justify-center">
        <a-popconfirm :title="t('确定要拒绝该请求吗？')" okText="decline" @confirm="decline">
          <template #icon>
            <CheckCircleOutlined :style="{ color: '#a9ad57' }" />
          </template>
          <a-button type="danger" size="small" shape="round" :loading="decline_loading">{{ t('拒绝请求') }}</a-button>
        </a-popconfirm>
      </div>
      <DrawdownBack :uuid="uuid" :detail="detail" @change="update" v-if="detail?.has_permission && (detail?.mark == 'drawdown_fc' || detail?.mark == 'drawdown_director')"></DrawdownBack>
    </template>
    <!-- 分配利益相关者 -->
    <div class="flex justify-center mt-3">
      <AddStake :uuid="uuid" :detail="detail" :projectDetail="projectDetail" :stake="detail?.stake" @change="update" v-if="detail?.has_permission && detail?.mark === 'drawdown_fc'">
        <a-button type="brown" shape="round" size="small">{{ t('分配投资者') }}</a-button>
      </AddStake>
    </div>
    <a-popconfirm v-if="hasPermission('projects:repayments:revoke') && detail?.mark === 'drawdown_lm_recon' && detail?.state !== 1000 && detail?.name !== 'Initial drawdown'" :title="t('您确定撤销放款吗？')" @confirm="revokeHandle">
      <a-button type="brown" class="big uppercase w-full">{{ t('撤销放款') }}</a-button>
    </a-popconfirm>
  </div>
  <TipEditForecast @confirm="accept" v-model:visible="visible_tip"></TipEditForecast>
</template>

<script setup>
import { ref, watch, onMounted,computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { CheckCircleOutlined } from '@ant-design/icons-vue';
import { hasPermission } from '@/directives/permission/index';
import { forecastDarwdown, loanDsel, loanDdeclinel, loanDsaveStep, loanDrecall, loanDrevoke } from '@/api/project/loan';
import DrawdownAmount from './form/DrawdownAmount.vue';
import DrawdownRequest from './form/DrawdownRequest.vue';
import DrawdownBack from './form/DrawdownBack.vue';
import AcceptFc from './form/AcceptFc.vue';
import AddStake from './form/addStake.vue';
import ReconciliationModal from '@/views/projects/components/ReconciliationModal.vue';
import PushBackLog from '@/views/projects/components/PushBackLog.vue';
import { useUserStore } from '@/store';

const pageRole = computed(() => useUserStore().pageRole);
const mode = pageRole.value ? '/' + pageRole.value.toLowerCase() : '';
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
const visible_tip = ref(false);

const colors = ref({
  'DRAWDOWN CONFIRM': {
    bg: 'rgba(169,173,87,.2)',
    color: '#a9ad57'
  },
  'LM REVIEW': {
    bg: 'rgba(211, 166, 49,.2)',
    color: '#d3a631'
  },
  'LM PENDING REVIEW': {
    bg: 'rgba(211, 166, 49,.2)',
    color: '#d3a631'
  },
  'FC REVIEW': {
    bg: 'rgba(211, 166, 49,.2)',
    color: '#d3a631'
  },
  'FC PENDING REVIEW': {
    bg: 'rgba(211, 166, 49,.2)',
    color: '#d3a631'
  },
  'PENDING APPROVAL…': {
    bg: 'rgba(211, 166, 49,.2)',
    color: '#d3a631'
  },
  'DECLINED DRAWDOWN': {
    bg: 'rgba(136, 136, 136,.2)',
    color: '#888'
  }
});

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
const decline = () => {
  decline_loading.value = true;
  loanDdeclinel({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
    })
    .finally((_) => {
      decline_loading.value = false;
    });
};

// 同意
const accept = () => {
  accept_loading.value = true;
  loanDsaveStep({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
    })
    .finally((_) => {
      accept_loading.value = false;
    });
};

// 召回
const recall = () => {
  accept_loading.value = true;
  loanDrecall({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
    })
    .finally((_) => {
      accept_loading.value = false;
    });
};

const revokeHandle = async () => {
  await loanDrevoke({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
      return true;
    })
    .catch(() => {
      return false;
    });
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
  min-height: 395px;

  .title {
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 1px;
    text-transform: uppercase;
    margin-bottom: 5px;
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
