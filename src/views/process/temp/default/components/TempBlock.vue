<template>
  <div>
    <!-- 表单基础信息编辑弹窗 -->
    <check-edit-dialog
      v-model:visible="showCheckDialog"
      :info-data="currentInfoData"
      :type="currentType"
      :code="currentCode"
      @done="dataRefresh"
    ></check-edit-dialog>

    <template v-for="item in blockArr">
      <!-- 反洗钱 -->
      <template v-if="item === 'AML' && !hideWash">
        <wash-table
          :current-id="currentId"
          :current-step="currentStep"
          :block-info="blockInfo.AML"
          :wash-info="dataInfo.AML"
          @refresh="dataRefresh"
        ></wash-table>
      </template>

      <!-- 借款人信息 -->
      <template v-if="item === 'borrower'">
        <div
          class="block-item mb"
          :class="{ checked: dataInfo.borrower.is_check && blockInfo.borrower.showCheck }"
        >
          <vco-process-title :title="t('借款人信息')">
            <div class="flex gap-5">
              <a-popconfirm
                v-if="!dataInfo.borrower.is_check && blockInfo.borrower.showCheck"
                :title="t('确定通过审核吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="checkHandle(blockInfo.borrower.code)"
              >
                <a-button type="dark" shape="round" class="uppercase">
                  {{ t('审核') }}
                </a-button>
              </a-popconfirm>
              <a-button
                v-if="blockInfo.borrower.showEdit"
                type="primary"
                shape="round"
                class="uppercase"
                @click="showEdit(1, blockInfo.borrower.code)"
              >
                {{ t('编辑') }}
              </a-button>
            </div>
          </vco-process-title>
          <borrower-info :data="dataInfo.borrower"></borrower-info>
          <div v-if="blockInfo.borrower.showCheck" class="check-content">
            <i class="iconfont">&#xe647;</i>
          </div>
        </div>
      </template>

      <!-- 项目信息 -->
      <template v-else-if="item === 'project'">
        <div
          class="block-item mb"
          :class="{ checked: dataInfo.project.is_check && blockInfo.project.showCheck }"
        >
          <vco-process-title :title="t('项目信息')">
            <div class="flex gap-5">
              <a-popconfirm
                v-if="!dataInfo.project.is_check && blockInfo.project.showCheck"
                :title="t('确定通过审核吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="checkHandle(blockInfo.project.code)"
              >
                <a-button type="dark" shape="round" class="uppercase">
                  {{ t('审核') }}
                </a-button>
              </a-popconfirm>
              <a-button
                v-if="blockInfo.project.showEdit"
                type="primary"
                shape="round"
                class="uppercase"
                @click="showEdit(2, blockInfo.project.code)"
              >
                {{ t('编辑') }}
              </a-button>
            </div>
          </vco-process-title>
          <project-info :data="dataInfo.project"></project-info>
          <div v-if="blockInfo.project.showCheck" class="check-content">
            <i class="iconfont">&#xe647;</i>
          </div>
        </div>
      </template>

      <!-- 证件资料 -->
      <template v-else-if="item === 'cert'">
        <div
          class="block-item mb"
          :class="{ checked: dataInfo.cert.is_check && blockInfo.cert.showCheck }"
        >
          <vco-process-title :title="t('证件资料')">
            <div class="flex gap-5">
              <a-popconfirm
                v-if="!dataInfo.cert.is_check && blockInfo.cert.showCheck"
                :title="t('确定通过审核吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="checkHandle(blockInfo.cert.code)"
              >
                <a-button type="dark" shape="round" class="uppercase">
                  {{ t('审核') }}
                </a-button>
              </a-popconfirm>
              <a-button
                v-if="blockInfo.cert.showEdit"
                type="primary"
                shape="round"
                class="uppercase"
                @click="showEdit(3, blockInfo.cert.code)"
              >
                {{ t('编辑') }}
              </a-button>
            </div>
          </vco-process-title>
          <document-info :data="dataInfo.cert"></document-info>
          <div v-if="blockInfo.cert.showCheck" class="check-content">
            <i class="iconfont">&#xe647;</i>
          </div>
        </div>
      </template>

      <!-- 借款信息 -->
      <template v-else-if="item === 'loan'">
        <div
          class="block-item mb"
          :class="{ checked: dataInfo.loan.is_check && blockInfo.loan.showCheck }"
        >
          <vco-process-title :title="t('借款信息')">
            <div class="flex gap-5">
              <a-popconfirm
                v-if="!dataInfo.loan.is_check && blockInfo.loan.showCheck"
                :title="t('确定通过审核吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="checkHandle(blockInfo.loan.code)"
              >
                <a-button type="dark" shape="round" class="uppercase">
                  {{ t('审核') }}
                </a-button>
              </a-popconfirm>
              <a-button
                v-if="blockInfo.loan.showEdit"
                type="primary"
                shape="round"
                class="uppercase"
                @click="showEdit(4, blockInfo.loan.code)"
              >
                {{ t('编辑') }}
              </a-button>
            </div>
          </vco-process-title>
          <loan-info :data="dataInfo.loan"></loan-info>
          <div v-if="blockInfo.loan.showCheck" class="check-content">
            <i class="iconfont">&#xe647;</i>
          </div>
        </div>
      </template>

      <template v-else-if="item === 'lending'">
        <lending-form
          :current-id="currentId"
          :current-step="currentStep"
          :data-info="dataInfo"
          :block-info="blockInfo.lending"
          :lending-info="lendingInfo"
          @refresh="dataRefresh"
          @done="doneHandle('lendingDone')"
          @openData="openDataHanle"
        ></lending-form>
      </template>

      <template v-else-if="item === 'bonus'">
        <bouns-form
          :current-id="currentId"
          :current-step="currentStep"
          :block-info="blockInfo.bonus"
          :bonus-info="dataInfo.bonus"
          @refresh="dataRefresh"
        ></bouns-form>
      </template>

      <!-- 抵押物 -->
      <template v-else-if="item === 'security'">
        <security-items
          :current-id="currentId"
          :current-step="currentStep"
          :block-info="blockInfo.security"
          :project-info="dataInfo.project"
          :security-info="dataInfo.security"
          @refresh="dataRefresh"
        ></security-items>
      </template>

      <!-- 其他安全信息 -->
      <template v-else-if="item === 'warranty'">
        <guarantor-info
          :current-id="currentId"
          :current-step="currentStep"
          :block-info="blockInfo.warranty"
          :guarantor-info="dataInfo.warranty"
          @refresh="dataRefresh"
        ></guarantor-info>
      </template>

      <!-- 上传offer -->
      <template v-else-if="item === 'offer'">
        <offer-form
          :current-id="currentId"
          :current-step="currentStep"
          :block-info="blockInfo.offer"
          :offer-info="dataInfo.offer"
          @refresh="dataRefresh"
        ></offer-form>
      </template>

      <!-- 确认信息 -->
      <template v-else-if="item === 'confirm'">
        <confirm-form
          :current-id="currentId"
          :current-step="currentStep"
          :block-info="blockInfo.confirm"
          :offer-info="dataInfo.offer"
          :confirm-info="dataInfo.confirm"
          @refresh="dataRefresh"
        ></confirm-form>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import { cloneDeep } from "lodash";

import CheckEditDialog from './CheckEditDialog.vue';
import WashTable from './WashTable.vue';
import BorrowerInfo from './BorrowerInfo.vue';
import ProjectInfo from './ProjectInfo.vue';
import DocumentInfo from './DocumentInfo.vue';
import LoanInfo from './LoanInfo.vue';
import LendingForm from "./LendingForm.vue";
import BounsForm from "./BounsForm.vue";
import SecurityItems from "./SecurityItems.vue";
import GuarantorInfo from "./GuarantorInfo.vue";
import OfferForm from "./OfferForm.vue";
import ConfirmForm from "./ConfirmForm.vue";

import { projectAuditCheckMode } from "@/api/process"
import emitter from '@/event';

const { t } = useI18n();
const emits = defineEmits(['refresh', 'lendingDone', 'openData']);

const props = defineProps({
  blockArr: {
    type: Array,
    default: () => []
  },
  blockInfo: {
    type: Object,
    default: () => {}
  },
  dataInfo: {
    type: Object,
    default: () => {}
  },
  currentId: {
    type: [Number, String],
    default: ''
  },
  currentStep: {
    type: Object
  },
  hideWash: {
    type: Boolean,
    default: false
  }
})

const showCheckDialog = ref(false);
const currentInfoData = ref(null);
const currentType = ref('');
const currentCode = ref('');

const lendingInfo = computed(() => {
  const obj = {
    ...props.dataInfo.lending,
    loan_money: props.dataInfo.loan.loan_money
  }
  return obj
})

const showEdit = (type, code) => {
  let data = null;
  if (type === 1) {
    data = props.dataInfo.borrower;
    currentType.value = 'one';
  } else if (type === 2) {
    data = props.dataInfo.project;
    currentType.value = 'two';
  } else if (type === 3) {
    data = props.dataInfo.cert;
    currentType.value = 'three';
  } else if (type === 4) {
    data = props.dataInfo.loan;
    currentType.value = 'four';
  }

  currentCode.value = code

  if (data) {
    const dataObj = cloneDeep(data);
    dataObj.uuid = props.dataInfo.base.uuid || '';
    currentInfoData.value = dataObj;

    showCheckDialog.value = true;
  }
};

const checkHandle = async (code) => {
  const params = {
    uuid: props.currentId,
    code
  }
  await projectAuditCheckMode(params)
    .then(() => {
      emits('refresh');
      emitter.emit('refreshAuditHisList');
      return true;
    })
    .catch(() => {
      return false;
    });
}

const dataRefresh = () => {
  emits('refresh');
};

const doneHandle = (type) => {
  emits(type)
}

const openDataHanle = (data) => {
  emits('openData', data)
}
</script>