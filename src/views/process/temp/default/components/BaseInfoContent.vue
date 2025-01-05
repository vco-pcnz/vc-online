<template>
  <div>
    <!-- 借款人信息编辑弹窗 -->
    <check-edit-dialog
      v-model:visible="showCheckDialog"
      :info-data="currentInfoData"
      :type="currentType"
      @done="dataRefresh"
    ></check-edit-dialog>

    <div
      class="block-item mb"
      :class="{ checked: dataInfo.borrower_info.is_check && showCheck }"
    >
      <vco-process-title :title="t('借款人信息')">
        <div v-if="showCheck" class="flex gap-5">
          <a-popconfirm
            v-if="!dataInfo.borrower_info.is_check"
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="checkHandle(dataInfo.borrower_info.check_status)"
          >
            <a-button type="dark" shape="round" class="uppercase">
              {{ t('审核') }}
            </a-button>
          </a-popconfirm>
          <a-button
            v-if="showCheckEdit"
            type="primary"
            shape="round"
            class="uppercase"
            @click="showEdit(1)"
          >
            {{ t('编辑') }}
          </a-button>
        </div>
      </vco-process-title>
      <borrower-info :data="dataInfo.borrower_info"></borrower-info>
      <div v-if="showCheck" class="check-content">
        <i class="iconfont">&#xe647;</i>
      </div>
    </div>
    <div
      class="block-item mb"
      :class="{ checked: dataInfo.project_info.is_check && showCheck }"
    >
      <vco-process-title :title="t('项目信息')">
        <div v-if="showCheck" class="flex gap-5">
          <a-popconfirm
            v-if="!dataInfo.project_info.is_check"
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="checkHandle(dataInfo.project_info.check_status)"
          >
            <a-button type="dark" shape="round" class="uppercase">
              {{ t('审核') }}
            </a-button>
          </a-popconfirm>
          <a-button
            v-if="showCheckEdit"
            type="primary"
            shape="round"
            class="uppercase"
            @click="showEdit(2)"
          >
            {{ t('编辑') }}
          </a-button>
        </div>
      </vco-process-title>
      <project-info :data="dataInfo.project_info"></project-info>
      <div v-if="showCheck" class="check-content">
        <i class="iconfont">&#xe647;</i>
      </div>
    </div>
    <div
      class="block-item mb"
      :class="{ checked: dataInfo.project_cert.is_check && showCheck }"
    >
      <vco-process-title :title="t('证件资料')">
        <div v-if="showCheck" class="flex gap-5">
          <a-popconfirm
            v-if="!dataInfo.project_cert.is_check"
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="checkHandle(dataInfo.project_cert.check_status)"
          >
            <a-button type="dark" shape="round" class="uppercase">
              {{ t('审核') }}
            </a-button>
          </a-popconfirm>
          <a-button
            v-if="showCheckEdit"
            type="primary"
            shape="round"
            class="uppercase"
            @click="showEdit(3)"
          >
            {{ t('编辑') }}
          </a-button>
        </div>
      </vco-process-title>
      <document-info :data="dataInfo.project_cert"></document-info>
      <div v-if="showCheck" class="check-content">
        <i class="iconfont">&#xe647;</i>
      </div>
    </div>
    <div
      class="block-item mb"
      :class="{ checked: dataInfo.loan_info.is_check && showCheck }"
    >
      <vco-process-title :title="t('借款信息')">
        <div v-if="showCheck" class="flex gap-5">
          <a-popconfirm
            v-if="!dataInfo.loan_info.is_check"
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
            @confirm="checkHandle(dataInfo.loan_info.check_status)"
          >
            <a-button type="dark" shape="round" class="uppercase">
              {{ t('审核') }}
            </a-button>
          </a-popconfirm>
          <a-button
            v-if="showCheckLastEdit"
            type="primary"
            shape="round"
            class="uppercase"
            @click="showEdit(4)"
          >
            {{ t('编辑') }}
          </a-button>
        </div>
      </vco-process-title>
      <loan-info :data="dataInfo.loan_info"></loan-info>
      <div v-if="showCheck" class="check-content">
        <i class="iconfont">&#xe647;</i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { cloneDeep } from 'lodash';

import BorrowerInfo from './BorrowerInfo.vue';
import ProjectInfo from './ProjectInfo.vue';
import DocumentInfo from './DocumentInfo.vue';
import LoanInfo from './LoanInfo.vue';
import CheckEditDialog from './CheckEditDialog.vue';

import {
  lmAuditStatus,
  fcAuditStatus,
  auditLmCheckStatus,
} from '@/api/process';
import emitter from '@/event';

const emits = defineEmits(['refresh']);

const props = defineProps({
  stepType: {
    type: Number,
    default: 1,
  },
  dataInfo: {
    type: Object,
    default: () => {},
  },
});

const { t } = useI18n();

const showCheck = computed(() => {
  return [1, 2, 4].includes(props.stepType);
});

const showCheckEdit = computed(() => {
  return [1, 4].includes(props.stepType);
});

const showCheckLastEdit = computed(() => {
  return [1, 2].includes(props.stepType);
});

const showCheckDialog = ref(false);
const currentInfoData = ref(null);
const currentType = ref('');

const showEdit = (type) => {
  let data = null;
  if (type === 1) {
    data = props.dataInfo.borrower_info;
    currentType.value = 'one';
  } else if (type === 2) {
    data = props.dataInfo.project_info;
    currentType.value = 'two';
  } else if (type === 3) {
    data = props.dataInfo.project_cert;
    currentType.value = 'three';
  } else if (type === 4) {
    data = props.dataInfo.loan_info;
    currentType.value = 'four';
  }

  if (data) {
    const dataObj = cloneDeep(data);
    dataObj.uuid = props.dataInfo.uuid || '';
    currentInfoData.value = dataObj;

    showCheckDialog.value = true;
  }
};

const dataRefresh = () => {
  emits('refresh');
};

const checkHandle = async (check_status) => {
  let ajaxFn = null;
  let params = {};
  if (props.stepType === 1) {
    ajaxFn = lmAuditStatus;
    params = {
      lm_audit_status: check_status,
      uuid: props.dataInfo.uuid,
    };
  } else if (props.stepType === 2) {
    ajaxFn = fcAuditStatus;
    params = {
      fc_audit_status: check_status,
      uuid: props.dataInfo.uuid,
    };
  } else if (props.stepType === 4) {
    ajaxFn = auditLmCheckStatus;
    params = {
      lm_check_status: check_status,
      uuid: props.dataInfo.uuid,
    };
  }

  if (ajaxFn) {
    await ajaxFn(params)
      .then(() => {
        dataRefresh();
        emitter.emit('refreshAuditHisList');
        return true;
      })
      .catch(() => {
        return false;
      });
  }
};
</script>
