<template>
  <div>
    <!-- 抵押物选择弹窗 -->
    <securities-dialog v-model:visible="securitiesVisible" :select-data="relatedData" :is-details="true"></securities-dialog>

    <!-- 信息编辑弹窗 -->
    <drawdown-request ref="editDialogRef" :uuid="uuid" :data-info="detail" @change="update"></drawdown-request>

    <!-- 详情弹窗 -->
    <details-dialog v-model:visible="detailsVisible" :uuid="uuid" :detail-data="detail" @done="update"></details-dialog>

    <!-- 抵押物解压弹窗 -->
    <release-dialog v-model:visible="releaseVisible" :uuid="uuid" :detail-data="detail" @done="update"></release-dialog>

    <div class="color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px">{{ t('详情') }}</div>

    <div class="detail">
      <a-alert v-if="Boolean(detail?.cancel_reason)" message="Push back reason" :description="detail?.cancel_reason" type="error" class="cancel-reason" />

      <div class="my-3" style="padding-left: 5px">
        <div class="bold fs_xl">{{ detail?.name }}</div>
        <div class="color_grey fs_xs mt-2">{{ detail?.note }}</div>
      </div>

      <div class="flex gap-4">
        <a-button type="brown" shape="round" size="small" @click="navigationTo('/projects/documents?uuid=' + uuid + '&annex_id=' + detail?.annex_id)">{{ t('查看文件') }}</a-button>
        <a-button v-if="detail?.security && detail?.security?.length" type="brown" shape="round" size="small" @click="openSecurity">{{ detail?.is_dis === 1 ? t('已解押抵押物') : t('关联抵押物') }}</a-button>
      </div>

      <div v-if="Number(detail?.reduction_money)" class="flex items-center box mt-4">
        <i class="iconfont left-icon mr-3">&#xe799;</i>
        <div>
          <vco-number :value="detail?.reduction_money" :precision="2" :bold="true" size="fs_xl"></vco-number>
          <p class="bold color_grey fs_2xs">{{ t('罚息减免') }}</p>
        </div>
      </div>

      <div class="flex items-center box mt-4">
        <i class="iconfont left-icon mr-3">&#xe757;</i>
        <div>
          <div class="flex">
            <vco-number :value="repaymentAmount" :precision="2" :bold="true" size="fs_2xl" :color="Number(detail?.reduction_money) ? '#31bd65' : '#282828'"></vco-number>
            <i v-if="detail?.has_permission && detail?.mark === 'repayment_lm'" @click="openEditHandle" class="iconfont edit">&#xe8cf;</i>
          </div>
          <p class="bold color_grey fs_2xs">{{ t('申请金额') }}: {{ tool.formatMoney(detail?.apply_amount) }}</p>
        </div>
      </div>

      <div class="mt-10">
        <div v-if="detail?.prev_permission" class="mb-5">
          <a-popconfirm :title="t('您确实要撤回该请求吗？')" @confirm="recall">
            <a-button type="dark" class="big uppercase" :loading="accept_loading" style="width: 100%">{{ t('撤回申请') }}</a-button>
          </a-popconfirm>
        </div>

        <div v-if="detail?.has_permission || hasPermission('projects:repayments:revoke')">
          <template v-if="detail?.has_permission">
            <!-- 对账 -->
            <ReconciliationModal v-if="detail?.mark === 'repayment_lm_recon'" :detail="detail" :uuid="uuid" :type="2" @update="update">
              <a-button type="cyan" class="big uppercase" style="width: 100%"> {{ t('对账') }} </a-button>
            </ReconciliationModal>
            <!-- 接受请求 -->
            <a-button v-else type="dark" class="big uppercase w-full" @click="detailsVisible = true">{{ t('接受请求') }}</a-button>
          </template>

          <a-popconfirm v-if="hasPermission('projects:repayments:revoke') && !detail?.has_permission && detail?.status < 2 && detail?.status" :title="t('您确定撤销还款吗？')" @confirm="revokeHandle">
            <a-button type="brown" class="big uppercase w-full">{{ t('撤销还款') }}</a-button>
          </a-popconfirm>

          <div v-if="detail?.has_permission && (detail?.mark == 'repayment_lm' || detail?.mark == 'repayment_fc' || detail?.mark == 'repayment_director')" class="mt-4">
            <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来拒绝还款请求。') }}</p>
            <div class="flex justify-center">
              <a-popconfirm :title="t('确定要拒绝该请求吗？')" @confirm="decline">
                <a-button type="danger" size="small" shape="round">{{ t('拒绝请求') }}</a-button>
              </a-popconfirm>
            </div>
          </div>

          <div v-if="detail?.status >= 2 && hasPermission('projects:repayments:release') && detail?.is_dis !== 1" class="mt-4">
            <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来释放抵押物。') }}</p>
            <div class="flex justify-center">
              <a-button type="dark" size="small" shape="round" @click="releaseVisible = true">{{ t('抵押物解押') }}</a-button>
            </div>
          </div>

          <DrawdownBack v-if="detail?.mark === 'repayment_fc' && detail?.has_permission" :uuid="uuid" :detail="detail" @change="update"></DrawdownBack>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import tool, { navigationTo } from '@/utils/tool';
import { hasPermission } from '@/directives/permission/index';
import DrawdownBack from './form/DrawdownBack.vue';
import { loanRdeclinel, loanRsaveStep, loanRrecall, loanRrevoke } from '@/api/project/loan';
import ReconciliationModal from '@/views/projects/components/ReconciliationModal.vue';
import SecuritiesDialog from './form/SecuritiesDialog.vue';
import DrawdownRequest from './form/DrawdownRequest.vue';
import DetailsDialog from './form/DetailsDialog.vue';
import ReleaseDialog from './form/ReleaseDialog.vue';

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
const accept_loading = ref(false);

const repaymentAmount = computed(() => {
  const reduction_money = Number(props.detail?.reduction_money);
  if (reduction_money) {
    const apply_amount = Number(props.detail?.apply_amount);
    const res = tool.minus(apply_amount, reduction_money);
    return res;
  } else {
    return props.detail?.apply_amount;
  }
});

// 拒绝
const decline = async () => {
  await loanRdeclinel({ uuid: props.uuid, id: props.detail?.id }).then(() => {
    update();
  });
};

// 同意
const accept = async () => {
  await loanRsaveStep({ uuid: props.uuid, id: props.detail?.id }).then((res) => {
    update();
  });
};

// 召回
const recall = async () => {
  await loanRrecall({ uuid: props.uuid, id: props.detail?.id }).then((res) => {
    update();
  });
};

const revokeHandle = async () => {
  await loanRrevoke({ uuid: props.uuid, id: props.detail?.id })
    .then((res) => {
      update();
      return true;
    })
    .catch(() => {
      return false;
    });
};

const securitiesVisible = ref(false);
const relatedData = ref([]);

const openSecurity = () => {
  relatedData.value = props.detail?.security;
  securitiesVisible.value = true;
};

const update = () => {
  emits('update');
};

const editDialogRef = ref();
const openEditHandle = () => {
  editDialogRef.value && editDialogRef.value.init();
};

const detailsVisible = ref(false);

const releaseVisible = ref(false);
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
