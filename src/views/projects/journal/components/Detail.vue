<template>
  <div class="color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px">{{ t('详情') }}</div>

  <div class="detail">
    <a-alert v-if="Boolean(detail?.cancel_reason)" :message="t('退回原因')" :description="detail?.cancel_reason" type="error" class="cancel-reason" />

    <a-row :gutter="24">
      <a-col :span="24" class="item-txt flex justify-between items-center">
        <div class="bold fs_xl">{{ detail.cate == 1 ? 'Journal' : 'Duration' }}</div>
        <div>
          <Add v-if="hasPermission('projects:journal:edit') && detail.state == 0 && detail.status == 0" :currentId="uuid" :projectDetail="projectDetail" :detail="detail" @update="update">
            <a-button type="cyan" shape="round" size="small">{{ t('编辑') }}</a-button>
          </Add>
        </div>
      </a-col>
      <a-col :span="24" class="item-txt">
        <p>{{ t('类型') }}</p>
        <div>{{ detail.type_name }}</div>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('方法') }}</p>
        <div>{{ detail.addsub == 1 ? t('增加') : t('减少') }}</div>
      </a-col>
      <a-col :span="12" class="item-txt">
        <p>{{ t('金额') }}</p>
        <vco-number :value="detail.amount" :precision="2" :end="true"></vco-number>
      </a-col>
      <a-col v-if="detail.note" :span="24" class="item-txt">
        <p>{{ t('声明说明') }}</p>
        <p>{{ detail.note }}</p>
      </a-col>
      <a-col v-if="detail.remark" :span="24" class="item-txt">
        <p>{{ t('审阅意见') }}</p>
        <p>{{ detail.remark }}</p>
      </a-col>
    </a-row>

    <div v-if="detail?.prev_permission" class="mt-10">
      <a-popconfirm :title="t('您确实要撤回该请求吗？')" @confirm="bindRecall">
        <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('撤回申请') }}</a-button>
      </a-popconfirm>
    </div>

    <div v-if="detail.has_permission && detail?.state != 0" class="mt-10">
      <a-popconfirm :title="t('您确定要接受该请求吗？')" @confirm="accept">
        <a-button type="dark" class="big uppercase" style="width: 100%">{{ t('接受请求') }}</a-button>
      </a-popconfirm>
      <a-popconfirm :title="t('您确定要拒绝该请求吗？')" @confirm="bindDecline" class="mt-3">
        <a-button type="danger" class="big uppercase" style="width: 100%">{{ t('拒绝请求') }}</a-button>
      </a-popconfirm>
      <div class="mt-4">
        <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来退回解押请求。') }}</p>
        <Back :uuid="uuid" :detail="detail" @change="update">
          <a-button type="danger" size="small" shape="round">{{ t('退回请求') }}</a-button>
        </Back>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';
import { useI18n } from 'vue-i18n';
import tool from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import Back from './form/Back.vue';
import { saveStep, recall, decline } from '@/api/project/journal';
import Add from './form/Add.vue';

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
  await saveStep({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
      return true;
    })
    .catch(() => {
      return false;
    });
};

// 召回
const bindRecall = async () => {
  await recall({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
      return true;
    })
    .catch(() => {
      return false;
    });
};

// 拒绝
const bindDecline = async () => {
  await decline({ uuid: props.uuid, id: props.detail?.id })
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
