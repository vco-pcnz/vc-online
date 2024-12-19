<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="main-info-container">
        <template v-if="dataInfo && !pageLoading">
          <vco-page-panel :title="dataInfo.project_apply_sn" @back="navigationTo('/requests/loan')">
            <div v-if="dataInfo" class="flex gap-5">
              <vco-status v-if="!dataInfo.has_permission" :title="t(dataInfo.status_name)" type="primary"></vco-status>

              <a-popconfirm
                v-if="dataInfo.has_permission && !dataInfo.is_audit"
                :title="t('确定取消项目吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="() => cancelHandle(false)"
              >
                <a-button
                  type="grey" shape="round" class="bold uppercase"
                >{{ t('取消项目') }}</a-button>
              </a-popconfirm>

              <a-popconfirm
                v-if="dataInfo.has_permission && dataInfo.is_audit"
                :title="t('确定取消审核吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="() => cancelHandle(true)"
              >
                <a-button
                  type="grey" shape="round" class="bold uppercase"
                >{{ t('取消审核') }}</a-button>
              </a-popconfirm>

              <a-button
                v-if="dataInfo.has_permission"
                type="primary"
                shape="round"
                class="bold uppercase"
                @click="nextHandle"
              >{{ t(dataInfo.status_name) }}</a-button>
            </div>
          </vco-page-panel>

          <div class="block-container">
            <div class="left-content">
              <div v-if="dataInfo.next_index > 1" class="block-item details">
                <vco-process-title :title="t('借款人信息')"></vco-process-title>
                <borrower-info :data="borrowerInfoData"></borrower-info>
              </div>
              <div v-if="dataInfo.next_index > 2" class="block-item details">
                <vco-process-title :title="t('项目信息')"></vco-process-title>
                <project-info :data="projectInfoData"></project-info>
              </div>
              <div v-if="dataInfo.next_index > 3" class="block-item details">
                <vco-process-title :title="t('证件资料')"></vco-process-title>
                <document-info :data="documentInfoData"></document-info>
              </div>
              <div v-if="dataInfo.next_index > 4" class="block-item details">
                <vco-process-title :title="t('借款信息')"></vco-process-title>
                <loan-info :data="loanInfoData"></loan-info>
              </div>
            </div>
            <div class="right-content">
              <bind-users
                :current-id="currentId"
                :is-details="true"
              ></bind-users>

              <div v-if="isNormalUser" class="block-item ads-content">
                <img src="./../../../assets/images/img1.png" alt="">
              </div>
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
  import { projectDetailApi } from "@/api/process";
  import BorrowerInfo from "@/views/process/temp/default/components/BorrowerInfo.vue";
  import ProjectInfo from "@/views/process/temp/default/components/ProjectInfo.vue";
  import DocumentInfo from "@/views/process/temp/default/components/DocumentInfo.vue";
  import LoanInfo from "@/views/process/temp/default/components/LoanInfo.vue";
  import BindUsers from "@/views/process/components/BindUsers.vue";
  import { useUserStore } from "@/store";
  import { processRoutes } from "@/constant"

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