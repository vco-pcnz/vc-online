<template>
  <div>
    <!-- 抵押物选择弹窗 -->
    <securities-dialog v-model:visible="securitiesVisible" :select-data="relatedData" :is-details="true"></securities-dialog>

    <!-- 信息编辑弹窗 -->
    <drawdown-request ref="editDialogRef" :uuid="uuid" :data-info="detail" :projectDetail="projectDetail" @change="update"></drawdown-request>
    <drawdown-request-vsl ref="editVslDialogRef" :uuid="uuid" :data-info="detail" :projectDetail="projectDetail" @change="update"></drawdown-request-vsl>

    <!-- 详情弹窗 -->
    <details-dialog v-model:visible="detailsVisible" :uuid="uuid" :is-accept="detailsAccept" :detail-data="detail" @done="update"></details-dialog>
    <details-dialog-vsl v-model:visible="detailsVisibleVsl" :uuid="uuid" :is-accept="detailsAccept" :detail-data="detail" @done="update"></details-dialog-vsl>

    <!-- 抵押物解压弹窗 -->
    <release-dialog v-model:visible="releaseVisible" :uuid="uuid" :detail-data="detail" @done="update"></release-dialog>

    <!-- 取消全额还款 -->
    <a-modal :width="486" :open="cancelAllVisible" :title="t('取消全额还款')" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form ref="cAllformRef" layout="vertical" :model="cAllformState" :rules="cAllformRules">
          <a-form-item :label="t('取消全额还款理由')" name="cancel_reason">
            <a-textarea v-model:value="cAllformState.cancel_reason" :rows="6" />
          </a-form-item>
        </a-form>

        <div class="flex justify-center">
          <a-button type="dark" class="save big uppercase" :loading="cancelAllLoading" @click="cancelAllHandle">
            {{ t('确定') }}
          </a-button>
        </div>
      </div>
    </a-modal>

    <div class="color_grey fs_2xs text-center py-3 text-uppercase uppercase" style="letter-spacing: 1px">{{ t('详情') }}</div>

    <div class="detail relative">
      <div style="position: absolute; right: 10px; top: 10px; cursor: pointer" v-if="detail?.cancellog && detail?.cancellog.length">
        <PushBackLog :data="detail?.cancellog"></PushBackLog>
      </div>
      <a-alert v-if="Boolean(detail?.cancel_reason)" :message="detail?.do_cancel === 1 ? t('取消全额还款理由') : 'Push back reason'" type="error" class="cancel-reason">
        <template #description>
          <div v-html="detail?.cancel_reason"></div>
        </template>
      </a-alert>

      <div class="my-3" style="padding-left: 5px">
        <div class="bold fs_xl">{{ detail?.name }}</div>
        <div class="color_grey fs_xs mt-2" v-if="detail?.note">{{ t('说明') }}: {{ detail?.note }}</div>
        <div class="color_grey fs_xs" v-if="detail?.remark">{{ t('消息') }}: {{ detail?.remark }}</div>
      </div>

      <div class="flex gap-4">
        <a-button type="brown" shape="round" size="small" @click="navigationTo(`${mode}/projects/documents?uuid=` + uuid + '&annex_id=' + detail?.annex_id)">{{ t('查看文件') }}</a-button>
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
            <i v-if="hasPermission('projects:repayments:edit') && detail?.mark === 'repayment_lm'" @click="openEditHandle(false)" class="iconfont edit">&#xe8cf;</i>
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
            <a-button v-else type="dark" class="big uppercase w-full" @click="openDetails(true)">{{ t('接受请求') }}</a-button>
          </template>

          <a-popconfirm
            v-if="!detail?.prev_permission && hasPermission('projects:repayments:revoke') && [0, 1].includes(Number(detail?.status)) && detail?.state > 0 && !['repayment_lm', 'drawdown_lm'].includes(detail.mark) && !detail?.all_repayment"
            :title="t('您确定撤销还款吗？')"
            @confirm="revokeHandle"
          >
            <a-button type="brown" class="big uppercase w-full mt-4">{{ t('撤销还款') }}</a-button>
          </a-popconfirm>

          <template v-if="detail?.all_repayment && hasPermission('projects:repayments:all_repayment_cancel') && [0, 1].includes(Number(detail?.status)) && detail?.state > 0 && ['repayment_lm_recon'].includes(detail.mark)">
            <a-button type="brown" class="big uppercase w-full mt-4" @click="openEditHandle(true)">{{ t('修改全额还款') }}</a-button>

            <div class="mt-4 flex justify-center">
              <a-button type="danger" size="small" shape="round" @click="cancelAllVisible = true">{{ t('取消全额还款') }}</a-button>
            </div>
          </template>

          <div v-if="detail?.has_permission && (detail?.mark == 'repayment_lm' || detail?.mark == 'repayment_fc' || detail?.mark == 'repayment_lc' || detail?.mark == 'repayment_director')" class="mt-4">
            <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来拒绝还款请求。') }}</p>
            <div class="flex justify-center">
              <a-popconfirm :title="t('确定要拒绝该请求吗？')" @confirm="decline">
                <a-button type="danger" size="small" shape="round">{{ t('拒绝请求') }}</a-button>
              </a-popconfirm>
            </div>
          </div>

          <!-- <div v-if="detail?.status >= 2 && hasPermission('projects:repayments:release') && detail?.is_dis !== 1" class="mt-4">
            <p class="text-center color_grey fs_xs my-3">{{ t('您可以点击下面的按钮来释放抵押物。') }}</p>
            <div class="flex justify-center">
              <a-button type="dark" size="small" shape="round" @click="releaseVisible = true">{{ t('抵押物解押') }}</a-button>
            </div>
          </div> -->

          <DrawdownBack v-if="['repayment_fc', 'repayment_lc'].includes(detail?.mark) && detail?.has_permission && detail?.do_cancel !== 1" :uuid="uuid" :detail="detail" @change="update"></DrawdownBack>
        </div>

        <a-button v-if="!detail?.prev_permission && !(detail?.has_permission || hasPermission('projects:repayments:revoke'))" type="brown" class="big uppercase w-full" @click="openDetails(false)">{{ t('查看详情') }}</a-button>

        <p class="download-btn" v-if="all_repayment">
          {{ t('对账单') }}, <span @click="downloadStatement">{{ t('点击下载') }}</span>
        </p>
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
import { loanRdeclinel, loanRsaveStep, loanRrecall, loanRrevoke, projectLoanAllRepayment, loanRgoBack } from '@/api/project/loan';
import ReconciliationModal from '@/views/projects/components/ReconciliationModal.vue';
import SecuritiesDialog from './form/SecuritiesDialog.vue';
import DrawdownRequest from './form/DrawdownRequest.vue';
import DrawdownRequestVsl from './form/DrawdownRequestVsl.vue';
import DetailsDialog from './form/DetailsDialog.vue';
import DetailsDialogVsl from './form/DetailsDialogVsl.vue';
import ReleaseDialog from './form/ReleaseDialog.vue';
import PushBackLog from '@/views/projects/components/PushBackLog.vue';
import { useUserStore } from '@/store';
import dayjs from 'dayjs';

const pageRole = computed(() => useUserStore().pageRole);
const mode = pageRole.value ? '/' + pageRole.value.toLowerCase() : '';
const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: [String, Number]
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
  return props.detail?.apply_amount;
});

const all_repayment = computed(() => {
  return Number(props.detail?.all_repayment || 0) === 1 ? true : false;
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
const editVslDialogRef = ref();
// const openEditHandle = () => {
//   if (props.projectDetail.product.code === 'vsl') {
//     editVslDialogRef.value && editVslDialogRef.value.init();
//   } else {
//     editDialogRef.value && editDialogRef.value.init();
//   }
const openEditHandle = (allCancel = false) => {
  if (props.projectDetail.product.code === 'vsl') {
    editVslDialogRef.value && editVslDialogRef.value.init();
  } else {
    editDialogRef.value && editDialogRef.value.init(allCancel);
  }
};

const detailsVisible = ref(false);
const detailsVisibleVsl = ref(false);
const detailsAccept = ref(false);

const openDetails = (accept) => {
  detailsAccept.value = accept;
  if (props.projectDetail.product.code === 'vsl') {
    detailsVisibleVsl.value = true;
  } else {
    detailsVisible.value = true;
  }
};

const releaseVisible = ref(false);

const downloadStatement = () => {
  const params = {
    uuid: props.uuid,
    date: dayjs(props.detail.apply_date).format('YYYY-MM-DD'),
    pdf: 1,
    less: props.detail.reduction_money || 0,
    verify: 1,
    verify_id: props.detail?.id
  };

  if (props.detail.extra && props.detail.extra.length) {
    params.extra = props.detail.extra;
    params.extra_amount = Number(props.detail.extra_amount || 0);
  }

  projectLoanAllRepayment(params).then((res) => {
    window.open(res);
  });
};

const cAllformRef = ref();
const cancelAllVisible = ref(false);
const cAllformState = ref({
  cancel_reason: ''
});
const cAllformRules = ref({
  cancel_reason: [{ required: true, message: t('请输入') + t('取消全额还款理由'), trigger: 'blur' }]
});
const cancelAllLoading = ref(false);
const cancelAllHandle = () => {
  cAllformRef.value
    .validate()
    .then(() => {
      const params = {
        cancel_reason: cAllformState.value.cancel_reason,
        uuid: props.uuid,
        id: props.detail?.id,
        back_step: 'repayment_fc',
        do_cancel: 1
      };

      cancelAllLoading.value = true;
      loanRgoBack(params)
        .then(() => {
          cancelAllLoading.value = false;
          cancelAllVisible.value = false;
          update();
        })
        .catch(() => {
          cancelAllLoading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const updateVisible = (value) => {
  if (!value && !cancelAllLoading.value) {
    cAllformRef.value.clearValidate();
    cAllformRef.value.resetFields();
    cAllformState.value.cancel_reason = '';
  }
  cancelAllVisible.value = value;
};
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

.download-btn {
  font-size: 13px;
  text-align: center;
  margin-top: 10px;
  span {
    color: #f19915;
    cursor: pointer;
    &:hover {
      color: #f19915;
    }
  }
}
</style>
