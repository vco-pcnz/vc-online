<template>
  <div>
    <reject-dialog
      v-model:visible="rejectVisible"
      :uuid="currentId"
      :type="currnetType"
    ></reject-dialog>

    <a-spin :spinning="pageLoading" size="large">
      <div class="main-info-container">
        <template v-if="dataInfo && !pageLoading">
          <vco-page-panel :title="dataInfo.project_apply_sn" @back="navigationTo('/requests/loan')">
            <div v-if="dataInfo" class="flex gap-5">
              <vco-status
                v-if="!dataInfo.has_permission"
                :title="t(dataInfo.status_name)"
                :type="statusType"
                type="primary"
              ></vco-status>

              <a-popconfirm
                v-if="dataInfo.has_permission && !dataInfo.is_audit"
                :title="t('确定取消项目吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="() => cancelHandle()"
              >
                <a-button
                  type="grey" shape="round" class="bold uppercase"
                >{{ t('取消项目') }}</a-button>
              </a-popconfirm>

              <a-button
                v-if="dataInfo.has_permission && dataInfo.is_audit && dataInfo.next_index === 5"
                type="grey" shape="round" class="bold uppercase"
                @click="rejectHandle(1)"
              >{{ t('拒绝申请') }}</a-button>

              <a-button
                v-if="dataInfo.has_permission && dataInfo.is_audit && dataInfo.next_index !== 5"
                type="grey" shape="round" class="bold uppercase"
                @click="rejectHandle(2)"
              >{{ t('退回重新修改') }}</a-button>

              <a-button
                v-if="dataInfo.has_permission"
                type="primary"
                shape="round"
                class="bold uppercase"
                @click="nextHandle"
              >{{ t(dataInfo.status_name) }}</a-button>
            </div>
          </vco-page-panel>

          <div v-if="dataInfo.status === -900" class="block-item details process-fail">
            <p class="title">{{ t('拒绝原因') }}</p>
            <p class="info">{{ dataInfo.decline_reason || t('拒绝原因') }}</p>
          </div>

          <div class="block-container">
            <div class="left-content">
              <template v-if="dataInfo">
                <div v-if="showBlock(1)" class="block-item details">
                  <vco-process-title :title="t('借款人信息')"></vco-process-title>
                  <borrower-info :data="borrowerInfoData"></borrower-info>
                </div>
                <div v-if="showBlock(2)" class="block-item details">
                  <vco-process-title :title="t('项目信息')"></vco-process-title>
                  <project-info :data="projectInfoData"></project-info>
                </div>
                <div v-if="showBlock(3)" class="block-item details">
                  <vco-process-title :title="t('证件资料')"></vco-process-title>
                  <document-info :data="documentInfoData"></document-info>
                </div>
                <div v-if="showBlock(4)" class="block-item details">
                  <vco-process-title :title="t('借款信息')"></vco-process-title>
                  <loan-info :data="loanInfoData"></loan-info>
                </div>
              </template>
            </div>
            <div class="right-content">
              <bind-users
                :current-id="currentId"
                :is-details="true"
                :created-user="createdUser"
              ></bind-users>

              <ads-content></ads-content>
            </div>
          </div>
        </template>
        <a-empty v-if="!dataInfo && !pageLoading" :image="simpleImage" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref, onMounted, computed } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import { Empty } from 'ant-design-vue';
  import { navigationTo } from "@/utils/tool";
  import { projectDetailApi, applyCancelProject } from "@/api/process";
  import BorrowerInfo from "@/views/process/temp/default/components/BorrowerInfo.vue";
  import ProjectInfo from "@/views/process/temp/default/components/ProjectInfo.vue";
  import DocumentInfo from "@/views/process/temp/default/components/DocumentInfo.vue";
  import LoanInfo from "@/views/process/temp/default/components/LoanInfo.vue";
  import BindUsers from "@/views/process/components/BindUsers.vue";
  import AdsContent from "@/views/process/components/AdsContent.vue";
  import RejectDialog from "@/views/process/components/RejectDialog.vue";

  import { useUserStore } from "@/store";
  import { processRoutes } from "@/constant"
  import emitter from "@/event"

  const { t } = useI18n();
  const route = useRoute();

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const currentId = ref()
  const pageLoading = ref(true)
  const dataInfo = ref(null)

  const borrowerInfoData = ref()
  const projectInfoData = ref()
  const documentInfoData = ref()
  const loanInfoData = ref()

  const userStore = useUserStore();

  const isNormalUser = computed(() => userStore.isNormalUser);
  const createdUser = ref({
    avatar: "",
    name: ""
  })

  const statusType = computed(() => {
    const status = dataInfo.value.status
    if (status === -900) {
      return 'error'
    } else if (status === -100) {
      return 'grey'
    } else if (status === 1000) {
      return 'success'
    } else {
      return 'primary'
    }
  })

  const showBlock = (index = 0) => {
    const isOpen = dataInfo.value.status > 900 || dataInfo.value.status === 900
    const isCancel = dataInfo.value.status === -100
    const isDeclined = dataInfo.value.status === -900

    if (isCancel || isDeclined || isOpen) {
      return true
    } else {
      if (dataInfo.value.next_index) {
        return dataInfo.value.next_index > index
      } 
    }

    return false
  }

  const getDataInfo = () => {
    projectDetailApi({
      uuid: currentId.value
    }).then(res => {
      if (res) {
        dataInfo.value = res

        createdUser.value = {
          avatar: res.create_user_avatar,
          name: res.create_user_name
        }

        borrowerInfoData.value = res.borrower_info
        projectInfoData.value = res.project_info
        documentInfoData.value = res.project_cert
        loanInfoData.value = res.loan_info
      }
      
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
    })
  }

  const cancelHandle = async () => {
    await applyCancelProject({
      uuid: dataInfo.value.uuid
    }).then(() => {
      // 触发列表数据刷新
      emitter.emit('refreshRequestsList')
      navigationTo('/requests/loan')
    })
  }

  const rejectVisible = ref(false)
  const currnetType = ref(1)
  const rejectHandle = (type) => {
    currnetType.value = type
    rejectVisible.value = true
  }

  const nextHandle = () => {
    const href = processRoutes[dataInfo.value.next_index - 1]
    if (href) {
      navigationTo(`${href}?uuid_info=${dataInfo.value.uuid}`)
    }
  }

  onMounted(() => {
    const { uuid_info } = route.query;
    if (uuid_info) {
      currentId.value = uuid_info
      getDataInfo()
    } else {
      pageLoading.value = false
    }
  })
</script>

<style lang="less" scoped>
  .block-container {
    width: 100%;
    display: flex;
    gap: 30px;
    > .left-content {
      flex: 1;
    }
    > .right-content {
      width: 420px;
    }
  }

  .ads-content {
    overflow: hidden;
    padding: 10px;
  }
</style>