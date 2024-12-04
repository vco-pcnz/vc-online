<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="main-info-container">
        <template v-if="dataInfo && !pageLoading">
          <vco-page-panel :title="dataInfo.project_apply_sn" @back="navigationTo('/requests/loan')">
            <div v-if="showOprea(dataInfo.status)" class="flex gap-5">
              <vco-status v-if="notSubStatus(dataInfo.status)" :title="t('待提交')" type="primary"></vco-status>
              <vco-status v-if="notCheckStatus(dataInfo.status)" :title="t('待审核')" type="primary"></vco-status>

              <a-popconfirm
                v-if="notSubStatus(dataInfo.status)"
                :title="t('确定取消项目吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="() => cancelHandle(false)"
              >
                <a-button
                  v-permission="'requests:details:cancel:pro'"
                  type="grey" shape="round" class="bold uppercase"
                >{{ t('取消项目') }}</a-button>
              </a-popconfirm>

              <a-popconfirm
                v-if="canCancelCheck(dataInfo.status)"
                :title="t('确定取消审核吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="() => cancelHandle(true)"
              >
                <a-button
                  v-permission="'requests:details:cancel:rev'"
                  type="grey" shape="round" class="bold uppercase"
                >{{ t('取消审核') }}</a-button>
              </a-popconfirm>

              <!-- 继续填写资料 -->
              <a-button
                v-if="notSubStatus(dataInfo.status)"
                v-permission="'requests:details:continue'"
                type="dark"
                shape="round"
                class="bold uppercase"
                @click="enterPage(dataInfo.status, dataInfo.uuid)"
              >{{ t('继续填写') }}</a-button>

              <!-- 审核 -->
              <a-button
                v-if="notCheckStatus(dataInfo.status)"
                v-permission="'requests:details:check'"
                type="dark"
                shape="round"
                class="bold uppercase"
                @click="enterPage(dataInfo.status, dataInfo.uuid)"
              >{{ t('前往操作') }}</a-button>
            </div>
          </vco-page-panel>

          <div class="block-container">
            <div class="left-content">
              <div v-if="dataInfo.status >= 100" class="block-item details">
                <vco-process-title :title="t('借款人信息')"></vco-process-title>
                <borrower-info :data="borrowerInfoData"></borrower-info>
              </div>
              <div v-if="dataInfo.status >= 200" class="block-item details">
                <vco-process-title :title="t('项目信息')"></vco-process-title>
                <project-info :data="projectInfoData"></project-info>
              </div>
              <div v-if="dataInfo.status >= 300" class="block-item details">
                <vco-process-title :title="t('证件资料')"></vco-process-title>
                <document-info :data="documentInfoData"></document-info>
              </div>
              <div v-if="dataInfo.status >= 400" class="block-item details">
                <vco-process-title :title="t('借款信息')"></vco-process-title>
                <loan-info :data="loanInfoData"></loan-info>
              </div>
            </div>
            <div class="right-content">2</div>
          </div>
        </template>
        <a-empty v-if="!dataInfo && !pageLoading" :image="simpleImage" />
      </div>
    </a-spin>
  </div>
</template>

<script setup>
  import { ref, onMounted } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import { Empty } from 'ant-design-vue';
  import { navigationTo } from "@/utils/tool";
  import { projectDetailApi } from "@/api/process";
  import BorrowerInfo from "@/views/process/temp/default/components/BorrowerInfo.vue";
  import ProjectInfo from "@/views/process/temp/default/components/ProjectInfo.vue";
  import DocumentInfo from "@/views/process/temp/default/components/DocumentInfo.vue";
  import LoanInfo from "@/views/process/temp/default/components/LoanInfo.vue";
  import {
    showOprea,
    notSubStatus,
    notCheckStatus,
    canCancelCheck,
    enterPage,
    cancelProjectHandle,
    cancelCheckHandle
  } from "@/hooks/useRequestsTool"

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

  const getDataInfo = () => {
    projectDetailApi({
      uuid: currentId.value
    }).then(res => {
      if (res) {
        dataInfo.value = res

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

  const cancelHandle = async (flag) => {
    const ajaxFn = flag ? cancelCheckHandle : cancelProjectHandle
    await ajaxFn(dataInfo.value.uuid).then(() => {
      navigationTo('/requests/loan')
    })
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
</style>