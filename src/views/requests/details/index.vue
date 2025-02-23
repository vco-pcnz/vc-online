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

              <a-popconfirm
                v-if="dataInfo.prev_permission"
                :title="t('确定召回该项目吗？')"
                :ok-text="t('确定')"
                :cancel-text="t('取消')"
                @confirm="() => recallHandle()"
              >
                <a-button
                  type="grey" shape="round" class="bold uppercase"
                >{{ t('召回项目') }}</a-button>
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
                <div v-if="borrowerInfoData.borrower_about" class="block-item details">
                  <vco-process-title :title="t('借款人信息')"></vco-process-title>
                  <borrower-info :data="borrowerInfoData"></borrower-info>
                </div>
                <div v-if="projectInfoData.project_name" class="block-item details">
                  <vco-process-title :title="t('项目信息')"></vco-process-title>
                  <project-info :data="projectInfoData"></project-info>
                </div>
                <div v-if="showCert" class="block-item details">
                  <vco-process-title :title="t('证件资料')"></vco-process-title>
                  <document-info :data="documentInfoData"></document-info>
                </div>
                <div v-if="Number(loanInfoData.loan_money)" class="block-item details">
                  <vco-process-title :title="t('借款信息')"></vco-process-title>
                  <loan-info :data="loanInfoData"></loan-info>
                </div>

                <template v-if="showMoreInfo">
                  <security-items
                    v-if="securityInfoData.count"
                    :is-details="true"
                    :block-info="{showEdit: false}"
                    :security-info="securityInfoData"
                  ></security-items>

                  <lending-form
                    v-if="Number(lendingData.build_amount) || Number(lendingData.land_amount)"
                    :is-details="true"
                    :current-id="currentId"
                    :block-info="{showEdit: false}"
                    :data-info="dataInfo"
                    :lending-info="lendingData"
                  ></lending-form>

                  <guarantor-info
                    v-if="showWarranty"
                    :current-id="currentId"
                    :is-details="true"
                    :block-info="{showEdit: false}"
                    :guarantor-info="warrantyData"
                  ></guarantor-info>

                  <offer-form
                    v-if="showOffer"
                    :is-details="true"
                    :current-id="currentId"
                    :block-info="{showEdit: false}"
                    :offer-info="offerData"
                  ></offer-form>

                  <confirm-form
                    v-if="confirmData.confirm"
                    :current-id="currentId"
                    :is-details="true"
                    :block-info="{showEdit: false}"
                    :confirm-info="confirmData"
                  ></confirm-form>

                  <wash-table
                    :current-id="currentId"
                    :is-details="true"
                    :block-info="{showEdit: false}"
                    :wash-info="{is_check: false}"
                  ></wash-table>
                </template>
              </template>
            </div>
            <div class="right-content">
              <bind-users
                :current-id="currentId"
                :is-details="true"
                :created-user="createdUser"
              ></bind-users>

              <ads-content></ads-content>

              <template v-if="showMoreInfo">
                <operation-log
                  :is-details="true"
                  :current-id="currentId"
                ></operation-log>

                <security-list
                  v-if="securityInfoData.count"
                  :current-id="currentId"
                  :is-details="true"
                  :block-info="{showEdit: false}"
                >
                </security-list>

                <forecast-list
                  v-if="Number(lendingData.build_amount) || Number(lendingData.land_amount)"
                  :current-id="currentId"
                  :is-details="true"
                  :show-list="true"
                  :block-info="{showEdit: false}"
                ></forecast-list>

                <conditions-list
                  v-if="dataInfo.is_audit && statusType === 'primary'"
                  :current-id="currentId"
                  :is-details="true"
                  :end-date="currentDataInfo.loan.end_date"
                ></conditions-list>
              </template>
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
  import { projectDetailApi, applyCancelProject, recallProject } from "@/api/process";
  import BorrowerInfo from "@/views/process/temp/default/components/BorrowerInfo.vue";
  import ProjectInfo from "@/views/process/temp/default/components/ProjectInfo.vue";
  import DocumentInfo from "@/views/process/temp/default/components/DocumentInfo.vue";
  import LoanInfo from "@/views/process/temp/default/components/LoanInfo.vue";
  import SecurityItems from "@/views/process/temp/default/components/SecurityItems.vue";
  import LendingForm from "@/views/process/temp/default/components/LendingForm.vue";
  import GuarantorInfo from "@/views/process/temp/default/components/GuarantorInfo.vue";
  import OfferForm from "@/views/process/temp/default/components/OfferForm.vue";
  import ConfirmForm from "@/views/process/temp/default/components/ConfirmForm.vue";

  import OperationLog from "@/views/process/components/OperationLog.vue";
  import ForecastList from "@/views/process/components/ForecastList.vue";
  import SecurityList from "@/views/process/components/SecurityList.vue";
  import WashTable from '@/views/process/temp/default/components/WashTable.vue';
  import ConditionsList from "@/views/process/components/ConditionsList.vue";
  import BindUsers from "@/views/process/components/BindUsers.vue";
  import AdsContent from "@/views/process/components/AdsContent.vue";
  import RejectDialog from "@/views/process/components/RejectDialog.vue";
  

  import { processRoutes } from "@/constant"
  import emitter from "@/event"

  const { t } = useI18n();
  const route = useRoute();

  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;

  const currentId = ref()
  const pageLoading = ref(true)
  const dataInfo = ref(null)
  const currentDataInfo = ref(null)

  const borrowerInfoData = ref()
  const projectInfoData = ref()
  const documentInfoData = ref()
  const loanInfoData = ref()
  const securityInfoData = ref()
  const lendingData = ref()
  const warrantyData = ref()
  const offerData = ref()
  const confirmData = ref()

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

  const showMoreInfo = computed(() => {
    return dataInfo.value.ptRole !== 1
  })

  const getDataInfo = () => {
    projectDetailApi({
      uuid: currentId.value
    }).then(res => {
      if (res) {
        currentDataInfo.value = res
        dataInfo.value = res.base

        createdUser.value = {
          avatar: res.base.create_user_avatar,
          name: res.base.create_user_name
        }

        borrowerInfoData.value = res.borrower
        projectInfoData.value = res.project
        documentInfoData.value = res.cert
        loanInfoData.value = res.loan
        securityInfoData.value = res.security
        lendingData.value = res.lending
        warrantyData.value = res.warranty
        offerData.value = res.offer
        confirmData.value = res.confirm
      }
      
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
    })
  }

  const showCert = computed(() => {
    return documentInfoData.value.building_consent_files || documentInfoData.value.engineering_plan_approval_files || documentInfoData.value.feasibility_files || documentInfoData.value.others_files || documentInfoData.value.resource_consent_files
  })

  const showWarranty = computed(() => {
    return warrantyData.value.guarantor_list.length || warrantyData.value.main_contractor || warrantyData.value.security_package.length
  })

  const showOffer = computed(() => {
    return offerData.value.cert_images || offerData.value.sign_offer
  })

  const cancelHandle = async () => {
    await applyCancelProject({
      uuid: dataInfo.value.uuid
    }).then(() => {
      // 触发列表数据刷新
      emitter.emit('refreshRequestsList')
      navigationTo('/requests/loan')
    })
  }

  const recallHandle = async () => {
    await recallProject({
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
      navigationTo(`${href}?uuid=${dataInfo.value.uuid}`)
    }
  }

  onMounted(() => {
    const { uuid } = route.query;
    if (uuid) {
      currentId.value = uuid
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