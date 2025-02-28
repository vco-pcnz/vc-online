<template>
  <detail-layout active-tab="about" ref="detailLayoutRef" @getProjectDetail="getProjectDetail">
    <template #content>
      <a-spin :spinning="loading" size="large">
        <div class="project-container">
          <div class="project-info">
            <base-card :detail="detail"></base-card>

            <a-collapse expand-icon-position="end" ghost>
              <a-collapse-panel key="Associate" class="collapse-card">
                <template #header>
                  <div class="associate-content">
                    <i class="iconfont" style="font-size: 14px">&#xe720;</i>
                    <span class="title">{{ t('关联用户') }}</span>
                  </div>
                </template>
                <bind-users :current-id="currentId" :is-close="Boolean(detail?.base.is_close)" :about="true"></bind-users>
              </a-collapse-panel>

              <a-collapse-panel key="History" class="collapse-card history-card">
                <template #header>
                  <i class="iconfont">&#xe76c;</i>
                  <span class="title">{{ t('历史') }}</span>
                </template>
                <history :currentId="currentId"></history>
              </a-collapse-panel>
              <a-collapse-panel key="Conditions" class="collapse-card conditions-card">
                <template #header>
                  <i class="iconfont">&#xe733;</i>
                  <span class="title">{{ t('条件') }}</span>
                </template>
                <conditions-list :current-id="currentId" :is-details="true" :is-close="Boolean(detail?.base.is_close)" :about="true" :end-date="detail.date.end_date"></conditions-list>
              </a-collapse-panel>
              <a-collapse-panel key="Request_details" class="collapse-card request-card">
                <template #header>
                  <i class="iconfont">&#xe732;</i>
                  <span class="title">{{ t('请求详情') }}</span>
                </template>
                <RequestDetails :data="detail" :currentId="currentId"></RequestDetails>
              </a-collapse-panel>
              <a-collapse-panel key="orgs" class="collapse-card request-card">
                <template #header>
                  <i class="iconfont">&#xe8db;</i>
                  <span class="title">{{ t('利益相关者') }}</span>
                </template>
                <Wash :currentId="currentId"></Wash>
              </a-collapse-panel>
            </a-collapse>
          </div>
          <div class="project-content">
            <!-- 关账流程 -->
            <Close v-if="detail?.base?.is_open != 3" :currentId="currentId" :toBeClosedFormData="toBeClosedFormData" :detail="detail" @update="update"></Close>
            <!-- 取消关账流程 -->
            <CloseCancel v-else :currentId="currentId" :toBeClosedFormData="ReOpenFormData" :detail="detail" @update="update"></CloseCancel>
            <MeterStat :data="detail?.credit"></MeterStat>
            <PeriodLine :data="detail?.date"></PeriodLine>
            <div class="flex justify-center mt-10 mb-10 btns">
              <template v-if="Boolean(!detail?.base.is_close)">
                <StartDefault v-if="hasPermission('projects:penalty:sedit') && !detail?.base?.penalty" :detail="detail" :currentId="currentId" @update="update">
                  <a-button type="brown" shape="round" size="small">{{ t('罚息开始') }}</a-button>
                </StartDefault>
                <a-button v-if="hasPermission('projects:penalty:view') && detail?.base?.penalty" type="brown" shape="round" size="small" @click="navigationTo('/projects/penalty?uuid=' + currentId)">{{ t('罚息') }}</a-button>

                <AddVariations v-if="hasPermission('projects:variations:edit') && !Boolean(detail?.base?.variation)" :currentId="currentId" :project-detail="detail" @update="update">
                  <a-button type="brown" shape="round" size="small">{{ t('添加变更') }}</a-button>
                </AddVariations>
                <a-button v-if="hasPermission('projects:variations:view') && detail?.base?.variation" type="brown" shape="round" size="small" @click="navigationTo('/projects/variations?uuid=' + currentId)">{{ t('变更1') }}</a-button>

                <Journal v-if="hasPermission('projects:journal:edit') && !detail?.base?.journal" :detail="detail" :currentId="currentId" @update="update">
                  <a-button type="brown" shape="round" size="small">{{ t('平账') }}</a-button>
                </Journal>
                <a-button v-if="hasPermission('projects:journal:view') && detail?.base?.journal" type="brown" shape="round" size="small" @click="navigationTo('/projects/journal?uuid=' + currentId)">{{ t('平账') }}</a-button>
              </template>
              <!-- fc  关闭拟关闭 -->
              <vco-form-dialog
                :title="t('拟关闭')"
                :initData="toBeClosedFormData"
                :formParams="{ uuid: currentId, process__id: detail?.close?.process__id }"
                url="projectDetail/close"
                @update="update"
                v-if="hasPermission('projects:about:add:closeFc') && detail?.base?.is_open == 1 && detail?.close?.state <= 0"
              >
                <a-button type="brown" shape="round" size="small">{{ t('拟关闭') }}</a-button>
              </vco-form-dialog>

              <!-- lc  撤回关闭 -->
              <vco-form-dialog
                :title="t('重新打开')"
                :initData="ReOpenFormData"
                :formParams="{ uuid: currentId, closeCancel_date: dayjs().format('YYYY-MM-DD'), process__id: detail?.closeCancel?.process__id }"
                url="projectDetail/closeCancel"
                @update="update"
                v-if="hasPermission('projects:about:close:revoke') && detail?.base?.is_open == 3 && detail?.closeCancel?.state <= 0"
              >
                <a-button type="brown" shape="round" size="small">{{ t('重新打开') }}</a-button>
              </vco-form-dialog>
            </div>
            <Stats :data="detail?.credit" :currentId="currentId"></Stats>
          </div>
        </div>
      </a-spin>
    </template>
  </detail-layout>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import detailLayout from '../components/detailLayout.vue';
import BaseCard from './components/base.vue';
import History from './components/history.vue';
import RequestDetails from './components/requestDetails.vue';
import Stats from './components/stats.vue';
import PeriodLine from './components/PeriodLine.vue';
import MeterStat from './components/MeterStat.vue';
import Wash from './components/wash.vue';
import Journal from '@/views/projects/journal/components/form/Add.vue';
import StartDefault from '@/views/projects/penalty/components/form/Add.vue';
import AddVariations from '@/views/projects/variations/components/form/AddVariations.vue';
import BindUsers from '@/views/process/components/BindUsers.vue';
import ConditionsList from '@/views/process/components/ConditionsList.vue';
import { hasPermission } from '@/directives/permission/index';
import { navigationTo } from '@/utils/tool';
import dayjs, { Dayjs } from 'dayjs';
import Close from './components/Close.vue';
import CloseCancel from './components/CloseCancel.vue';

const { t } = useI18n();
const route = useRoute();

const detailLayoutRef = ref(null);
const loading = ref(true);
const currentId = ref();
const detail = ref();

const getProjectDetail = (val) => {
  const uuid = route.query.uuid;
  currentId.value = uuid;
  detail.value = val;
  loading.value = false;
};

const disabledDateFormat = (current) => {
  const endDate = new Date();
  if (current && current.isBefore(endDate, 'day')) {
    return true;
  }

  return false;
};

const toBeClosedFormData = ref([
  {
    type: 'date',
    label: '日期',
    key: 'close_date',
    required: true,
    disabledDate: disabledDateFormat
  },
  {
    type: 'textarea',
    label: '说明',
    key: 'close_note',
    required: false
  }
]);

const ReOpenFormData = ref([
  {
    type: 'date',
    label: '日期',
    key: 'close_cancel_date',
    required: true,
    disabledDate: disabledDateFormat
  },
  {
    type: 'textarea',
    label: '说明',
    key: 'close_cancel_note',
    required: true
  },
  {
    type: 'upload',
    label: '文件',
    key: 'close_cancel_document',
    required: false
  }
]);

const update = () => {
  detailLayoutRef.value.getProjectDetail();
};
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

      &:nth-child(1) {
        border-top: 1px solid #e2e5e2;
      }

      &:nth-child(2) {
        border-top: 1px solid #e2e5e2;
        border-bottom: 1px solid #e2e5e2;
      }

      &:nth-child(3),
      &:nth-child(4) {
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

  .btns {
    .ant-btn {
      margin: 0 10px;
    }
  }
}

.cancel-reason {
  :deep(.ant-alert-message) {
    color: #c1430c !important;
  }
}

:deep(.ant-alert-description) {
  font-size: 12px !important;
}

.associate-content {
  position: relative;
  left: -6px;
  height: 33px;
  display: flex;
  align-items: center;
  .title {
    margin-left: 10px !important;
  }
}
</style>
