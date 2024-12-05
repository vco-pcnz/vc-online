<template>
  <div>
    <!-- 借款人信息编辑弹窗 -->
    <check-edit-dialog
      v-model:visible="showCheckDialog"
      :info-data="currentInfoData"
      :type="currentType"
      @done="dataRefresh"
    ></check-edit-dialog>

    <div class="block-item mb">
      <vco-process-title :title="t('借款人信息')">
        <div class="flex gap-5">
          <a-popconfirm
            v-if="!dataInfo.borrower_info.isCheck"
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
          >
            <a-button
              type="dark" shape="round"
            >{{ t('审核') }}</a-button>
          </a-popconfirm>
          <a-button
            type="primary" shape="round"
            @click="showEdit(1)"
          >{{ t('编辑') }}</a-button>
        </div>
      </vco-process-title>
      <borrower-info :data="dataInfo.borrower_info"></borrower-info>
    </div>
    <div class="block-item mb">
      <vco-process-title :title="t('项目信息')">
        <div class="flex gap-5">
          <a-popconfirm
            v-if="!dataInfo.project_info.isCheck"
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
          >
            <a-button
              type="dark" shape="round"
            >{{ t('审核') }}</a-button>
          </a-popconfirm>
          <a-button
            type="primary" shape="round"
            @click="showEdit(2)"
          >{{ t('编辑') }}</a-button>
        </div>
      </vco-process-title>
      <project-info :data="dataInfo.project_info"></project-info>
    </div>
    <div class="block-item mb">
      <vco-process-title :title="t('证件资料')">
        <div class="flex gap-5">
          <a-popconfirm
            v-if="!dataInfo.project_cert.isCheck"
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
          >
            <a-button
              type="dark" shape="round"
            >{{ t('审核') }}</a-button>
          </a-popconfirm>
          <a-button
            type="primary" shape="round"
            @click="showEdit(3)"
          >{{ t('编辑') }}</a-button>
        </div>
      </vco-process-title>
      <document-info :data="dataInfo.project_cert"></document-info>
    </div>
    <div class="block-item mb">
      <vco-process-title :title="t('借款信息')">
        <div class="flex gap-5">
          <a-popconfirm
            v-if="!dataInfo.loan_info.isCheck"
            :title="t('确定通过审核吗？')"
            :ok-text="t('确定')"
            :cancel-text="t('取消')"
          >
            <a-button
              type="dark" shape="round"
            >{{ t('审核') }}</a-button>
          </a-popconfirm>
          <a-button
            type="primary" shape="round"
            @click="showEdit(4)"
          >{{ t('编辑') }}</a-button>
        </div>
      </vco-process-title>
      <loan-info :data="dataInfo.loan_info"></loan-info>
    </div>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { useI18n } from "vue-i18n";
  import { cloneDeep } from "lodash";
  
  import BorrowerInfo from "./BorrowerInfo.vue";
  import ProjectInfo from "./ProjectInfo.vue";
  import DocumentInfo from "./DocumentInfo.vue";
  import LoanInfo from "./LoanInfo.vue";
  import CheckEditDialog from "./CheckEditDialog.vue";

  const emits = defineEmits(['refresh'])

  const props = defineProps({
    dataInfo: {
      type: Object,
      default: () => {}
    }
  })

  const { t } = useI18n();

  const showCheckDialog = ref(false)
  const currentInfoData = ref(null)
  const currentType = ref('')

  const showEdit = (type) => {
    let data = null
    if (type === 1) {
      data = props.dataInfo.borrower_info
      currentType.value = 'one'
    } else if (type === 2) {
      data = props.dataInfo.project_info
      currentType.value = 'two'
    } else if (type === 3) {
      data = props.dataInfo.project_cert
      currentType.value = 'three'
    } else if (type === 4) {
      data = props.dataInfo.loan_info
      currentType.value = 'four'
    }

    if (data) {
      currentInfoData.value = cloneDeep(data)
      showCheckDialog.value = true
    }
  }

  const dataRefresh = () => {
    emits('refresh')
  }
</script>