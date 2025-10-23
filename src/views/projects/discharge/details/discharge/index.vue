<template>
  <div>
    <discharge-reject-dialog
      v-model:visible="rejectVisible"
      :p_uuid="projectUuid"
      :id="currentId"
      @done="pageInit"
    />

    <!-- 解押弹窗 -->
    <security-discharge-dialog
      v-model:visible="securityDischargeDialogVisible"
      :uuid="projectUuid"
      :projectDetail="projectDetailInfo"
      :info-data="tableData"
      :detail-info="securityDetailInfo"
      :is-reapply="true"
      @done="pageInit"
    ></security-discharge-dialog>

    <vco-page-panel :title="$t('解押详情')" @back="goBack">
      <div
        v-if="((hasPermission('projects:securities:discharge:check') || hasPermission('projects:securities:discharge:request')) && !isClose)"
          class="flex justify-end items-center gap-5">
        <a-button
          v-if="hasPermission('projects:securities:discharge:check') && securityDetailInfo?.mark === 'discharge_security_fc'"
          type="danger"
          @click="rejectVisible = true"
        >{{ t('拒绝请求') }}</a-button>
        <a-popconfirm
          v-if="hasPermission('projects:securities:discharge:check') && securityDetailInfo?.mark === 'discharge_security_fc'"
          :title="t('您确定要接受该请求吗？')"
          @confirm="accept"
        >
          <a-button
            type="primary"
          >{{ t('审核') }}</a-button>
        </a-popconfirm>
        <a-button
          v-if="hasPermission('projects:securities:discharge:request') && securityDetailInfo?.mark === 'DECLINED'"
          type="dark"
          @click="securityDischargeDialogVisible = true"
        >{{ t('重新申请') }}</a-button>
      </div>
    </vco-page-panel>

    <a-spin :spinning="pageLoading" size="large">
      <div class="security-detail-content">
        <div class="project-info-container">
          <div class="project-info">
            <base-card :variations="true" :hide-time="true" :detail="projectDetailInfo"></base-card>
          </div>
        </div>

        <div class="project-content">
          <vco-status v-if="showStatus" class="status-txt" :title="showStatus.title" :type="showStatus.color"></vco-status>
          <div class="block-item">
            <a-row :gutter="24">
              <a-col :span="24" class="item-txt">
                <a-alert
                  v-if="Boolean(securityDetailInfo?.decline_reason)"
                  :message="t('拒绝原因')"
                  :description="securityDetailInfo?.decline_reason"
                  type="error"
                  class="mt-2"
                />
              </a-col>
              <a-col :span="18" class="item-txt">
                <p class="name">{{ t('文件夹名称') }}</p>
                <p class="txt">{{ securityDetailInfo?.info?.dirname || '--' }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('还款日期') }}</p>
                <p class="txt">{{ securityDetailInfo?.data?.repayment_date ? tool.showDate(securityDetailInfo?.data?.repayment_date) : '--' }}</p>
              </a-col>
              <a-col :span="18" class="item-txt">
                <p class="name">{{ t('解押说明') }}</p>
                <p class="txt">{{ securityDetailInfo?.data?.reason || '--' }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('还款金额1') }}</p>
                <vco-number class="number" :value="securityDetailInfo?.data?.repayment_amount || 0" :precision="2"></vco-number>
              </a-col>
              <a-col v-if="tableData.length" :span="24" class="item-txt">
                <p class="name">{{ t('抵押物信息') }}</p>
                <div class="table-content sys-table-content info-content no-top-line">
                  <a-table
                    rowKey="uuid"
                    :columns="tableColumns"
                    :data-source="tableData"
                    :pagination="false"
                    table-layout="fixed"
                  >
                    <template #bodyCell="{ column, record }">
                      <template v-if="column.dataIndex === 'amount'">
                        <vco-number size="fs_md" :value="record.amount" :precision="2"></vco-number>
                      </template>
                      <template v-if="column.dataIndex === 'is_gst'">
                        <span v-if="Number(record.is_gst) === 1">{{ t('包含') }}</span>
                        <span v-else>{{ t('不包含') }}</span>
                      </template>
                      <template v-if="column.dataIndex === 'real_amount'">
                        <vco-number size="fs_md" :value="record.real_amount" :precision="2"></vco-number>
                      </template>
                      <template v-if="column.dataIndex === 'net_proceeds_price'">
                        <vco-number size="fs_md" :value="record.net_proceeds_price" :precision="2"></vco-number>
                      </template>
                    </template>
                  </a-table>
                </div>
              </a-col>
              <a-col v-if="securityDetailInfo?.info?.document?.length" :span="24" class="item-txt">
                <p class="name">{{ t('文件') }}</p>
                <div class="info-content">
                  <div v-for="(item, index) in securityDetailInfo?.info?.document" :key="index" class="file-item">
                    <vco-file-item :file="item" :bg="true"></vco-file-item>
                  </div>
                </div>
              </a-col>
            </a-row>
          </div>
        </div>
      </div>
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import tool, { goBack } from '@/utils/tool';
import { dischargeNinfo, dischargeSaveNStep } from '@/api/project/loan';
import { projectDetail } from '@/api/project/project';
import { hasPermission } from '@/directives/permission/index';
import BaseCard from '@/views/projects/about/components/base.vue';
import DischargeRejectDialog from './../../table-content/components/DischargeRejectDialog.vue';
import SecurityDischargeDialog from './../../table-content/components/SecurityDischargeDialog.vue';

const { t } = useI18n();
const route = useRoute();

const pageLoading = ref(false);

const projectUuid = ref('');
const currentId = ref('');

const projectDetailInfo = ref(null);
const securityDetailInfo = ref(null);

const isClose = computed(() => {
  return Number(projectDetailInfo.value?.base?.is_close) === 1 || false
})

// 获取项目详情
const getProjectDetail = async () => {
  const res = await projectDetail({ uuid: projectUuid.value });
  projectDetailInfo.value = res;
}

// 获取抵押物详情
const getSecurityDetail = async () => {
  const res = await dischargeNinfo({ id: currentId.value });
  securityDetailInfo.value = res;
}

const showStatus = computed(() => {
  if (securityDetailInfo.value) {
    if (securityDetailInfo.value.mark === 'discharge_security_fc') {
      return {
        title: securityDetailInfo.value.status_name,
        color: 'cyan',
        key: 1
      }
    } else if (securityDetailInfo.value.mark === 'DECLINED') {
      return {
        title: securityDetailInfo.value.status_name,
        color: 'error',
        key: 2
      }
    } else {
      return {
        title: securityDetailInfo.value.status_name,
        color: 'green',
        key: 3
      }
    }
  } else {
    return null
  }
})

const tableColumns = reactive([
  { title: t('名称'), dataIndex: 'security_name', width: 100, align: 'center', ellipsis: true },
  { title: t('产权编号'), dataIndex: 'card_no', width: 90 },
  { title: t('类型'), dataIndex: 'type_name', width: 80, align: 'center' },
  { title: t('地址'), dataIndex: 'city', width: 110, align: 'center', ellipsis: true },
  { title: t('抵押物价值'), dataIndex: 'amount', width: 105, align: 'center' },
  { title: t('消费税'), dataIndex: 'is_gst', width: 90, align: 'center' },
  { title: t('当前抵押物价值'), dataIndex: 'real_amount', width: 140, align: 'center' },
  { title: t('净收益'), dataIndex: 'net_proceeds_price', width: 100, align: 'center' }
]);

const tableData = computed(() => {
  const data = securityDetailInfo.value?.data?.list || []
  return data
})

const securityDischargeDialogVisible = ref(false)
const rejectVisible = ref(false)
const accept = async () => {
  await dischargeSaveNStep({ uuid: projectUuid.value, id: currentId.value })
    .then(() => {
      goBack()
      return true;
    })
    .catch(() => {
      return false;
    });
};

const pageInit = async () => {
  pageLoading.value = true;
  await getProjectDetail();
  await getSecurityDetail();
  pageLoading.value = false;
}

onMounted(async () => {
  const p_uuid = route.query.p_uuid;
  const id = route.query.id;
  if (p_uuid && id) {
    projectUuid.value = p_uuid;
    currentId.value = id;

    await pageInit()
  }
})

</script>

<style lang="less" scoped>
@import '@/styles/variables.less';

.security-detail-content {
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
    position: relative;
    .status-txt {
      position: absolute;
      right: 43px;
      top: 15px;
      z-index: 9;
    }
    .block-item {
      padding-top: 40px;
    }
    .item-txt {
      margin-bottom: 20px;
      &:last-child {
        margin-bottom: 0;
      }
      .name {
        color: #999;
        font-size: 13px;
        margin-bottom: 3px;
      }
      .txt {
        font-size: 18px;
        font-weight: 500;
        color: #181818;
        > .old {
          font-size: 12px;
          font-weight: normal;
          color: #999;
        }
      }
      :deep(.number .ant-statistic-content) {
        font-size: 18px !important;
        font-weight: 500 !important;
      }
      .txt-box {
        display: flex;
        align-items: center;
        gap: 2px;
        &.line-info-box {
          gap: 15px;
        }
      }
      > .content {
        margin-top: 10px;
        display: flex;
        flex-wrap: wrap;
        gap: 25px;
        .item {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 16px;
          .number {
            :deep(.ant-statistic-content) {
              font-size: 16px !important;
              line-height: 1 !important;
            }
          }
        }
      }
      > .info-content {
        border: 1px solid #282828;
        border-radius: 10px;
        padding: 10px 15px;
        margin-top: 10px;
        :deep(.ant-table-thead > tr > th) {
          padding-left: 0 !important;
          padding-right: 0 !important;
        }
      }
    }
  }
}
</style>