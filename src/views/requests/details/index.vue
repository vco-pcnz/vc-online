<template>
  <div>
    <a-spin :spinning="pageLoading" size="large">
      <div class="main-info-container">
        <template v-if="dataInfo && !pageLoading">
          <vco-page-panel :title="dataInfo.project_apply_sn" @back="navigationTo('/requests/loan')">
            <div class="flex gap-5">
              <vco-status :title="t('等待审核')" type="primary"></vco-status>
              <a-button type="grey" shape="round" class="bold uppercase">{{ t('取消审核') }}</a-button>
              <a-button type="dark" shape="round" class="bold uppercase">{{ t('前往操作') }}</a-button>
            </div>
            
          </vco-page-panel>

          <div class="block-container">
            <div class="left-content">
              <div class="block-item details">
                <vco-process-title :title="t('借款人信息')"></vco-process-title>
                <borrower-info :data="borrowerInfoData"></borrower-info>
              </div>
              <div class="block-item details">
                <vco-process-title :title="t('项目信息')"></vco-process-title>
                <project-info :data="projectInfoData"></project-info>
              </div>
              <div class="block-item details">
                <vco-process-title :title="t('证件资料')"></vco-process-title>
                <document-info :data="documentInfoData"></document-info>
              </div>
              <div class="block-item details">
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
  import { projectApplyApplyInfo } from "@/api/process";
  import BorrowerInfo from "@/views/process/temp/default/components/BorrowerInfo.vue";
  import ProjectInfo from "@/views/process/temp/default/components/ProjectInfo.vue";
  import DocumentInfo from "@/views/process/temp/default/components/DocumentInfo.vue";
  import LoanInfo from "@/views/process/temp/default/components/LoanInfo.vue";

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
    projectApplyApplyInfo({
      uuid: currentId.value
    }).then(res => {
      if (res) {
        dataInfo.value = res

        borrowerInfoData.value = {
          borrower_type: res.borrower_type,
          borrower_images: res.borrower_images,
          first_name: res.first_name,
          middle_name: res.middle_name,
          last_name: res.last_name,
          organization_name: res.organization_name,
          borrower_id_num: res.borrower_id_num,
          borrower_email: res.borrower_email,
          borrower_phone_prefix: res.borrower_phone_prefix,
          borrower_phone: res.borrower_phone,
          borrower_postcode: res.borrower_postcode,
          borrower_region_one_name: res.borrower_region_one_name,
          borrower_region_two_name: res.borrower_region_two_name,
          borrower_region_three_name: res.borrower_region_three_name,
          borrower_address: res.borrower_address,
          borrower_about: res.borrower_about
        }

        projectInfoData.value = {
          project_name: res.project_name,
          project_type_name: res.project_type_name,
          project_postcode: res.project_postcode,
          building_num: res.building_num,
          region_one_name: res.region_one_name,
          region_two_name: res.region_two_name,
          region_three_name: res.region_three_name,
          project_address: res.project_address,
          project_name: res.project_name,
          project_about: res.project_about,
          project_images: res.project_images
        }

        documentInfoData.value = {
          resource_consent_files: res.resource_consent_files || [],
          engineering_plan_approval_files: res.engineering_plan_approval_files || [],
          building_consent_files: res.building_consent_files || [],
          feasibility_files: res.feasibility_files || [],
          others_files: res.others_files || []
        }

        loanInfoData.value = {
          loan_money: res.loan_money,
          loan_type_name: res.loan_type_name,
          start_date: res.start_date,
          end_date: res.end_date
        }
      }
      
      pageLoading.value = false
    }).catch(() => {
      pageLoading.value = false
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