<template>
  <detail-layout active-tab="about" @getProjectDetail="getProjectDetail">
    <template #content>
      <a-spin :spinning="pageLoading" size="large">
        <div v-if="currentProduct" class="main-info-container">
          <reject-dialog
            v-model:visible="rejectVisible"
            :uuid="currentId"
            :type="currnetType"
          ></reject-dialog>

          <div v-if="dataInfo?.status === -900" class="block-item details process-fail">
            <p class="title">{{ t('拒绝原因') }}</p>
            <p class="info">{{ dataInfo.decline_reason || t('拒绝原因') }}</p>
          </div>
          
          <div class="block-container">
            <div class="left-content">
              <template v-if="dataInfo && !pageLoading">
                <div v-if="borrowerInfoData.borrower_about" class="block-item details">
                  <vco-process-title :title="t('借款人信息')"></vco-process-title>
                  <component :is="BorrowerInfo" :data="borrowerInfoData" />
                </div>
                <div v-if="projectInfoData.project_name" class="block-item details">
                  <vco-process-title :title="t('项目信息')"></vco-process-title>
                  <component :is="ProjectInfo" :data="projectInfoData" />
                </div>
                <div v-if="showCert" class="block-item details">
                  <vco-process-title :title="t('证件资料')"></vco-process-title>
                  <component :is="DocumentInfo" :data="documentInfoData" />
                </div>
                <div v-if="Number(loanInfoData.old_loan_money)" class="block-item details">
                  <vco-process-title :title="t('借款信息')"></vco-process-title>
                  <component :is="LoanInfo" :data="loanInfoData" />
                </div>

                <template v-if="showMoreInfo">
                  <component :is="SecurityItems"
                    v-if="securityInfoData.count"
                    :is-details="true"
                    :block-info="{showEdit: false}"
                    :security-info="securityInfoData"
                  />

                  <component :is="LendingForm"
                    v-if="lendingData.start_date && lendingData.end_date && (Number(lendingData.build_amount) || Number(lendingData.land_amount) || Number(lendingData.loan_money))"
                    :is-details="true"
                    :current-id="currentId"
                    :block-info="{showEdit: false}"
                    :data-info="currentDataInfo"
                    :lending-info="lendingData"
                  />

                  <component :is="GuarantorInfo"
                    v-if="showWarranty"
                    :current-id="currentId"
                    :is-details="true"
                    :block-info="{showEdit: false}"
                    :guarantor-info="warrantyData"
                  />

                  <component :is="OfferForm"
                    v-if="showOffer"
                    :is-details="true"
                    :current-id="currentId"
                    :block-info="{showEdit: false}"
                    :offer-info="offerData"
                  />

                  <component :is="ConfirmForm"
                    v-if="confirmData.confirm"
                    :current-id="currentId"
                    :is-details="true"
                    :block-info="{showEdit: false}"
                    :confirm-info="confirmData"
                  />

                  <component :is="WashTable"
                    :current-id="currentId"
                    :is-details="true"
                    :block-info="{showEdit: false}"
                    :wash-info="{is_check: false}"
                  />
                </template>
              </template>
            </div>
            <div v-if="dataInfo && !pageLoading" class="right-content">
              <div class="block-item sec mb-5">
                <div class="flex justify-between items-center mb-5">
                  <p>{{ t('当前状态') }}</p>
                  <vco-status
                    :title="t(dataInfo.status_name)"
                    :type="statusType"
                    type="primary"
                  ></vco-status>
                </div>
                
                <div class="flex gap-5 justify-end flex-wrap">
                  <a-popconfirm
                    v-if="dataInfo.has_permission && !dataInfo.is_audit"
                    :title="t('确定取消项目吗？')"
                    :ok-text="t('确定')"
                    :cancel-text="t('取消')"
                    @confirm="() => cancelHandle()"
                  >
                    <a-button
                      type="grey" class="bold uppercase"
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
                      type="grey" class="bold uppercase"
                    >{{ t('召回项目') }}</a-button>
                  </a-popconfirm>

                  <a-button
                    v-if="dataInfo.has_permission && dataInfo.is_audit && dataInfo.next_index === 5"
                    type="grey" class="bold uppercase"
                    @click="rejectHandle(1)"
                  >{{ t('拒绝申请') }}</a-button>

                  <a-button
                    v-if="dataInfo.has_permission && dataInfo.is_audit && dataInfo.next_index !== 5"
                    type="grey" class="bold uppercase"
                    @click="rejectHandle(2)"
                  >{{ t('退回重新修改') }}</a-button>

                  <a-button
                    v-if="dataInfo.has_permission"
                    type="primary"
                    class="bold uppercase"
                    @click="nextHandle"
                  >{{ t(dataInfo.status_name) }}</a-button>
                </div>
              </div>

              <bind-users
                :current-id="currentId"
                :is-details="true"
                :created-user="createdUser"
              ></bind-users>

              <ads-content></ads-content>

              <template v-if="showMoreInfo">
                <return-log v-if="returnLogData.length" :list-data="returnLogData"></return-log>

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
                  v-if="(Number(lendingData.build_amount) || Number(lendingData.land_amount) || Number(lendingData.loan_money)) && showForecast"
                  :current-id="currentId"
                  :is-details="true"
                  :show-list="true"
                  :block-info="{showEdit: false}"
                  :product-type="currentProduct"
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
        </div>

        <a-empty v-if="!currentProduct && !pageLoading" />
      </a-spin>
    </template>
  </detail-layout>
</template>

<script setup>
  import { ref, computed, defineAsyncComponent } from "vue";
  import { useRoute } from "vue-router";
  import { useI18n } from "vue-i18n";
  import { navigationTo } from "@/utils/tool";
  import { applyCancelProject, recallProject } from "@/api/process";

  import ReturnLog from "@/views/process/components/ReturnLog.vue";
  import OperationLog from "@/views/process/components/OperationLog.vue";
  import ForecastList from "@/views/process/components/ForecastList.vue";
  import SecurityList from "@/views/process/components/SecurityList.vue";
  import ConditionsList from "@/views/process/components/ConditionsList.vue";
  import BindUsers from "@/views/process/components/BindUsers.vue";
  import AdsContent from "@/views/process/components/AdsContent.vue";
  import RejectDialog from "@/views/process/components/RejectDialog.vue";
  

  import { processRoutes } from "@/constant"
  import emitter from "@/event"

  import DetailLayout from '../components/DetailLayout.vue';

  const pageLoading = ref(true)
  
  const { t } = useI18n();
  const route = useRoute();

  const dataInfo = ref();
  const currentId = ref(route.query.uuid)
  const currentDataInfo = ref(null)
  const currentProduct = ref('')

  const borrowerInfoData = ref()
  const projectInfoData = ref()
  const documentInfoData = ref()
  const loanInfoData = ref()
  const securityInfoData = ref()
  const lendingData = ref()
  const warrantyData = ref()
  const offerData = ref()
  const confirmData = ref()

  const returnLogData = ref([])

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
    return dataInfo.value?.ptRole !== 1
  })

  const showForecast = computed(() => {
    return ['default', 'vsl', 'lendr'].includes(currentProduct.value)
  })

  const BorrowerInfo = computed(() => getComponent("BorrowerInfo"));
  const ProjectInfo = computed(() => getComponent("ProjectInfo"));
  const DocumentInfo = computed(() => getComponent("DocumentInfo"));
  const LoanInfo = computed(() => getComponent("LoanInfo"));
  const SecurityItems = computed(() => getComponent("SecurityItems"));
  const LendingForm = computed(() => getComponent("LendingForm"));
  const GuarantorInfo = computed(() => getComponent("GuarantorInfo"));
  const OfferForm = computed(() => getComponent("OfferForm"));
  const ConfirmForm = computed(() => getComponent("ConfirmForm"));
  const WashTable = computed(() => getComponent("WashTable"));

  const getComponent = (componentName) => {
    if (currentProduct.value) {
      return defineAsyncComponent(() =>
        import(`./../../../../views/process/temp/${currentProduct.value}/components/${componentName}.vue`)
      );
    } else {
      return ''
    }
  };
  
  const getProjectDetail = async (res) => {
    returnLogData.value = res.base?.cancel_log || []
    
    currentProduct.value = res.product.code

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

    pageLoading.value = false
  };

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
