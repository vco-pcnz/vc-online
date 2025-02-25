<template>
  <div class="color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px">{{ t('详情') }}</div>

  <div class="detail">
    <a-alert v-if="Boolean(detail?.cancel_reason)" :message="t('退回原因')" :description="detail?.cancel_reason" type="error" class="cancel-reason" />
    <div class="title-no uppercase">
      <span>{{ detail.status == 1 && detail.state2 > 0?t('结束流程'):t('开始流程') }}</span>
    </div>
    <a-row :gutter="24">
      <a-col :span="12" class="item-txt">
        <p>{{ t('开始时间') }}</p>
        <p>{{ detail.start_date ? tool.showDate(detail.start_date) : '--' }}</p>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('结束时间') }}</p>
        <p>{{ detail.end_date ? tool.showDate(detail.end_date) : '--' }}</p>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('开始状态') }}</p>
        <p>{{ detail.start_status_name || '--' }}</p>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('结束状态') }}</p>
        <p>{{ detail.end_status_name || '--' }}</p>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('开始备注') }}</p>
        <p>{{ detail.note || '--' }}</p>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('结束备注') }}</p>
        <p>{{ detail.note2 || '--' }}</p>
      </a-col>
      <a-col :span="24" class="item-txt">
        <p>{{ t('利率') }}</p>
        <p>{{ detail.rate }}%</p>
      </a-col>
    </a-row>

    <div v-if="detail?.status && hasPermission('projects:penalty:eedit') && detail?.state2 <= 0" class="mt-3">
      <End :uuid="uuid" :id="detail?.id" :detail="detail" @update="update">
        <a-button type="brown" shape="round" size="small">{{ t('默认结束') }}</a-button>
      </End>
    </div>
    <div v-if="(detail?.start_prev_permission && detail?.state2 <= 0) || detail?.end_prev_permission" class="mt-10">
      <a-popconfirm :title="t('您确实要撤回该请求吗？')" @confirm="recall">
        <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('撤回申请') }}</a-button>
      </a-popconfirm>
    </div>

    <div v-if="detail.start_has_permission || detail.end_has_permission" class="mt-10">
      <a-popconfirm :title="t('您确定要接受该请求吗？')" @confirm="accept">
        <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('接受请求') }}</a-button>
      </a-popconfirm>
      <a-popconfirm :title="t('您确定要拒绝该请求吗？')" @confirm="decline" class="mt-3">
        <a-button type="danger" class="big uppercase" style="width: 100%">{{ t('拒绝请求') }}</a-button>
      </a-popconfirm>
      <div class="mt-4" v-if="detail?.start_mark != 'penaltyStart_fc'">
        <p class="text-center color_grey fs_xs my-3">{{ t('您可以单击下面的按钮退回上一步。') }}</p>
        <Back :uuid="uuid" :detail="detail" @change="update">
          <div class="flex justify-center">
            <a-button type="danger" size="small" shape="round">{{ t('退回请求') }}</a-button>
          </div>
        </Back>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { navigationTo } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import Back from './form/Back.vue';
import End from './form/End.vue';
import { ssaveStep, srecall, sdecline, esaveStep, erecall, edecline } from '@/api/project/penalty';

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

// 同意
const accept = async () => {
  // status 0 开始 1 结束
  let ajaxFn = null;
  if (props.detail?.status) {
    ajaxFn = esaveStep;
  } else {
    ajaxFn = ssaveStep;
  }
  await ajaxFn({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
      return true;
    })
    .catch(() => {
      return false;
    });
};

// 拒绝
const decline = async () => {
  // status 0 开始 1 结束
  let ajaxFn = null;
  if (props.detail?.status) {
    ajaxFn = edecline;
  } else {
    ajaxFn = sdecline;
  }
  await ajaxFn({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
      return true;
    })
    .catch(() => {
      return false;
    });
};

// 召回
const recall = async () => {
  let ajaxFn = null;
  if (props.detail?.status && props.detail?.state2 > 0) {
    ajaxFn = erecall;
  } else {
    ajaxFn = srecall;
  }
  await ajaxFn({ uuid: props.uuid, id: props.detail?.id })
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

const addressInfo = (data) => {
  return `${data.address_short} ${data.address} ${data.suburb} ${data.region_one_name} ${data.country_name}`;
};

watch(
  () => props.detail,
  (val) => {
    if (val) {
    }
  }
);
</script>

<style scoped lang="less">
@import '@/styles/variables.less';
.detail {
  border: 1px solid #e2e5e2;
  box-shadow: 2px 2px 4px 0 hsla(120, 5%, 89%, 0.15), 5px 5px 7px 0 hsla(0, 0%, 53%, 0.1);
  border-radius: 12px;
  padding: 20px;
  min-height: 340px;

  .title-no {
    font-size: 16px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    span {
      background-color: @colorPrimary;
      font-size: 10px;
      padding: 4px 5px;
      border-radius: 3px;
      color: #fff;
      margin-right: 5px;
    }
  }
}

.cancel-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-message) {
    color: #c1430c !important;
  }
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}

.success-reason {
  padding: 10px !important;
  margin-bottom: 10px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}

.item-txt {
  margin-top: 10px;
  &.no {
    margin-top: 0;
  }
  &.total {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
  p {
    font-size: 12px;
    &:first-child {
      color: #999;
    }
  }
  :deep(.ant-statistic-content) {
    font-size: 13px !important;
  }
}
</style>
