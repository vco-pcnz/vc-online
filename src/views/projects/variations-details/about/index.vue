<template>
  <detail-layout active-tab="about" ref="detailLayoutRef" @getProjectDetail="getProjectDetail">
    <template #content>
      <a-spin :spinning="pageLoading" size="large">
        <variations-process v-if="!projectDetail?.variationInfo?.decline_reason" :uuid="uuid" :id="id" :detail="projectDetail" @update="updateHandle"></variations-process>
        <a-alert v-if="projectDetail?.variationInfo?.decline_reason" :message="t('拒绝原因')" :description="projectDetail?.variationInfo?.decline_reason" type="error" class="cancel-reason" />

        <div v-if="projectDetail" class="project-container">
          <div class="project-info">
            <base-card :variations="true" :detail="projectDetail"></base-card>
          </div>

          <div class="project-content">
            <variations-info :uuid="uuid" :id="id" :detail="projectDetail" :credit-items-data="creditItemsData" @update="updateHandle"></variations-info>
            <variation-documents
              :uuid="uuid"
              :id="id"
              :detail="projectDetail?.variationInfo?.document"
              v-if="(projectDetail?.variationInfo?.mark === 'variation_lm' || projectDetail?.variationInfo?.mark === 'variation_overdue_open') && projectDetail?.variationInfo?.has_permission && projectDetail?.variationInfo?.state > 0"
              @update="updateHandle"
            ></variation-documents>
            <variations-change-info :detail="projectDetail"></variations-change-info>
          </div>
        </div>
      </a-spin>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ruleCredit } from '@/api/process';
import DetailLayout from '../components/DetailLayout.vue';
import VariationsProcess from '../components/VariationsProcess.vue';
import VariationsInfo from '../components/VariationsInfo.vue';
import VariationsChangeInfo from '../components/VariationsChangeInfo.vue';
import VariationDocuments from '../components/VariationDocuments.vue';
import BaseCard from '@/views/projects/about/components/base.vue';
import { cloneDeep } from 'lodash';

const route = useRoute();
const { t } = useI18n();

const uuid = ref(route.query.uuid);
const id = ref(route.query.id);
const pageLoading = ref(true);

const projectDetail = ref();
const getProjectDetail = async (val) => {
  projectDetail.value = val;

  await getCreditData();
  pageLoading.value = false;
};

const creditData = ref([]);
const creditItemsData = ref([]);

const getCreditVal = () => {
  const variationInfo = projectDetail.value.variationInfo;
  const creditInfo = cloneDeep(variationInfo.credit);
  const keyArr = [];

  for (const key in creditInfo) {
    keyArr.push(key);
  }

  const colItems = creditData.value.filter((item) => keyArr.includes(item.credit_table));

  const perData = colItems.filter((item) => item.is_ratio);
  const dolData = colItems.filter((item) => !item.is_ratio);

  creditItemsData.value = [...perData, ...dolData];
};

const getCreditData = () => {
  ruleCredit().then((res) => {
    creditData.value = res || [];
    getCreditVal();
  });
};

const detailLayoutRef = ref();
const updateHandle = () => {
  detailLayoutRef.value.getProjectDetail();
};
</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.project-container {
  color: @color_coal;
  position: relative;
  display: grid;
  grid-template-columns: 315px 1fr;
  gap: 24px;
  align-items: flex-start;

  .project-info {
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid @clr_white;
    background-color: @clr_white;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
  }

  .project-content {
    padding-left: 30px;
  }
}

.cancel-reason {
  padding: 10px !important;
  margin-bottom: 30px;
  :deep(.ant-alert-description) {
    font-size: 12px !important;
  }
}
</style>
