<template>
  <detail-layout title="test1212" active-tab="about">
    <template #content>
      <div class="project-container">
        <div class="project-info">
          <base-card></base-card>
          <member></member>
          <a-collapse expand-icon-position="end" ghost>
            <a-collapse-panel key="History" class="collapse-card history-card">
              <template #header>
                <i class="iconfont">&#xe76c;</i>
                <span class="title">{{ t('历史') }}</span>
              </template>
              <history></history>
            </a-collapse-panel>
            <a-collapse-panel key="Conditions" class="collapse-card conditions-card">
              <template #header>
                <i class="iconfont">&#xe733;</i>
                <span class="title">{{ t('条件') }}</span>
              </template>
              <conditions></conditions>
            </a-collapse-panel>
            <a-collapse-panel key="Request_details" class="collapse-card request-card">
              <template #header>
                <i class="iconfont">&#xe732;</i>
                <span class="title">{{ t('请求详情') }}</span>
              </template>
              <RequestDetails></RequestDetails>
            </a-collapse-panel>
          </a-collapse>
        </div>
        <div class="project-content">
          <MeterStat></MeterStat>
          <PeriodLine></PeriodLine>
          <div class="flex justify-center mt-10 mb-10">
            <a-button type="brown" shape="round" size="small">{{ t('默认开始') }}</a-button>
            <a-button type="brown" shape="round" size="small" class="ml-10 mr-10">{{ t('添加变更') }}</a-button>
            <a-button type="brown" shape="round" size="small">{{ t('日志') }}</a-button>
          </div>
          <Stats></Stats>
        </div>
      </div>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import detailLayout from '../components/detailLayout.vue';
import BaseCard from './components/base.vue';
import Member from './components/member.vue';
import History from './components/history.vue';
import Conditions from './components/conditions.vue';
import RequestDetails from './components/requestDetails.vue';
import Stats from './components/stats.vue';
import PeriodLine from './components/PeriodLine.vue';
import MeterStat from './components/MeterStat.vue';
const { t } = useI18n();
const route = useRoute();

const getProjectDetail = (userId) => {
  const uuid = userId || route.query.uuid;
  if (uuid) {
    // 发起请求
  }
};

onMounted(() => {
  getProjectDetail();
});
</script>

<style scoped lang="less">
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

    .info-card {
      padding: 30px;
    }

    .collapse-card {
      :deep(.ant-collapse-header-text),
      :deep(.ant-collapse-header) {
        display: flex;
        align-items: center;
      }

      :deep(.ant-collapse-header) {
        padding: 18px 40px 18px 30px;
      }
      :deep(.ant-collapse-content-box) {
        padding: 4px 30px 30px;
      }
      i {
        font-size: 21px;
      }

      .title {
        margin-left: 16px;
        font-weight: 600;
      }

      &:nth-child(2) {
        border-top: 1px solid #e2e5e2;
        border-bottom: 1px solid #e2e5e2;
      }

      :deep(.ant-collapse-expand-icon) {
        color: @color_grey;
      }
    }
  }

  .project-content {
    border-radius: 12px;
    padding: 30px;
  }
}
</style>
