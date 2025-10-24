<template>
  <div>
    <!-- 编辑弹窗 -->
    <security-edit-dialog
      v-model:visible="securityEditDialogVisible"
      :uuid="projectUuid"
      :projectDetail="projectDetailInfo"
      :infoData="itemDataInfo"
      :reapply-edit="true"
      @done="pageInit"
    ></security-edit-dialog>


    <edit-reject-dialog
      v-model:visible="rejectVisible"
      :p_uuid="projectUuid"
      :id="currentId"
      @done="pageInit"
    />

    <vco-page-panel :title="$t('抵押物编辑申请详情')" @back="goBack">
      <div
        v-if="((hasPermission('projects:securities:edit:check') || hasPermission('projects:securities:edit')) && !isClose)"
          class="flex justify-end items-center gap-5">
        <a-button
          v-if="hasPermission('projects:securities:edit:check') && securityDetailInfo?.mark === 'security_edit_fc'"
          type="danger"
          @click="rejectVisible = true"
        >{{ t('拒绝请求') }}</a-button>
        <a-popconfirm
          v-if="hasPermission('projects:securities:edit:check') && securityDetailInfo?.mark === 'security_edit_fc'"
          :title="t('您确定要接受该请求吗？')"
          @confirm="accept"
        >
          <a-button
            type="primary"
          >{{ t('审核') }}</a-button>
        </a-popconfirm>
        <a-button
          v-if="hasPermission('projects:securities:edit') && securityDetailInfo?.mark === 'DECLINED'"
          type="dark"
          @click="securityEditDialogVisible = true"
        >{{ t('重新编辑') }}</a-button>
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
                <p class="name">{{ t('名称') }}</p>
                <div class="txt">
                  <p>{{ newData?.security_name }}</p>
                  <p class="old">{{ oldData?.security_name || '--' }}</p>
                </div>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('类型') }}</p>
                <div class="txt">
                  <p>{{ newData?.type_name }}</p>
                  <p class="old">{{ oldData?.type_name || '--' }}</p>
                </div>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('抵押物价值') }}</p>
                <vco-number :value="newData?.amount" :precision="2"></vco-number>
                <vco-number :value="oldData?.amount" :precision="2" class="old"></vco-number>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('保险价值') }}</p>
                <vco-number :value="newData?.insurance_value" :precision="2"></vco-number>
                <vco-number :value="oldData?.amount" :insurance_value="2" class="old"></vco-number>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('产权编号') }}</p>
                <div class="txt">
                  <p>{{ newData?.card_no }}</p>
                  <p class="old">{{ oldData?.card_no || '--' }}</p>
                </div>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('抵押登记日期') }}</p>
                <div class="txt">
                  <p>{{ newData?.mortgage_registration_date ? tool.showDate(newData?.mortgage_registration_date) : '--' }}</p>
                  <p class="old">{{ oldData?.mortgage_registration_date ? tool.showDate(oldData?.mortgage_registration_date) : '--' }}</p>
                </div>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('保险到期日') }}</p>
                <div class="txt">
                  <p>{{ newData?.insurance_expire_date ? tool.showDate(newData?.insurance_expire_date) : '--' }}</p>
                  <p class="old">{{ oldData?.insurance_expire_date ? tool.showDate(oldData?.insurance_expire_date) : '--' }}</p>
                </div>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('担保公司') }}</p>
                <div class="txt">
                  <p>{{ newData?.insurance_company || '--' }}</p>
                  <p class="old">{{ oldData?.insurance_company || '--' }}</p>
                </div>
              </a-col>
              <a-col :span="24" class="item-txt">
                <p class="name">{{ t('地址') }}</p>
                <div class="txt">
                  <p>{{ newData?.city || '--' }}</p>
                  <p class="old">{{ oldData?.city || '--' }}</p>
                </div>
              </a-col>
              <a-col :span="24" class="item-txt">
                <p class="name">{{ t('备注') }}</p>
                <div class="txt">
                  <p>{{ newData?.remark || '--' }}</p>
                  <p class="old">{{ oldData?.remark || '--' }}</p>
                </div>
              </a-col>
              <a-col v-if="Number(newData?.is_sales || 0) === 1" :span="24" class="item-txt">
                <p class="name">{{ t('预售信息') }}</p>
                <div class="info-content">
                  <a-row :gutter="24">
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('含消费税') }}</p>
                      <div class="txt">
                        <p v-if="Number(newData?.is_gst) === 1">{{ t('包含') }}</p>
                        <p v-else>{{ t('不包含') }}</p>
                        <p v-if="Number(oldData?.is_gst) === 1" class="old">{{ t('包含') }}</p>
                        <p v-else class="old">{{ t('不包含') }}</p>
                      </div>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('销售价格') }}</p>
                      <vco-number :value="newData?.sales_price" :precision="2"></vco-number>
                      <vco-number :value="oldData?.sales_price" :precision="2" class="old"></vco-number>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('回款金额') }}</p>
                      <vco-number :value="newData?.repayment_price" :precision="2"></vco-number>
                      <vco-number :value="oldData?.repayment_price" :precision="2" class="old"></vco-number>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('合同日期') }}</p>
                      <div class="txt">
                        <p>{{ newData?.contract_date ? tool.showDate(newData?.contract_date) : '--' }}</p>
                        <p class="old">{{ oldData?.contract_date ? tool.showDate(newData?.contract_date) : '--' }}</p>
                      </div>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('结算日期') }}</p>
                      <div class="txt">
                        <p>{{ newData?.settlement_date ? tool.showDate(newData?.settlement_date) : '--' }}</p>
                        <p class="old">{{ oldData?.settlement_date ? tool.showDate(newData?.settlement_date) : '--' }}</p>
                      </div>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('日落日期') }}</p>
                      <div class="txt">
                        <p>{{ newData?.sunset_date ? tool.showDate(newData?.sunset_date) : '--' }}</p>
                        <p class="old">{{ oldData?.sunset_date ? tool.showDate(newData?.sunset_date) : '--' }}</p>
                      </div>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('还款日期') }}</p>
                      <div class="txt">
                        <p>{{ newData?.repayment_date ? tool.showDate(newData?.repayment_date) : '--' }}</p>
                        <p class="old">{{ oldData?.repayment_date ? tool.showDate(newData?.repayment_date) : '--' }}</p>
                      </div>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('净收益') }}</p>
                      <vco-number :value="newData?.net_proceeds_price" :precision="2"></vco-number>
                      <vco-number :value="oldData?.net_proceeds_price" :precision="2" class="old"></vco-number>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('变化比例') }}</p>
                      <vco-number :value="newData?.variance" :precision="2" suffix="%" prefix=""></vco-number>
                      <vco-number :value="oldData?.variance" :precision="2" class="old"></vco-number>
                    </a-col>
                  </a-row>
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
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import tool, { goBack } from '@/utils/tool';
import { dischargeEinfo, dischargeSaveEStep } from '@/api/project/loan';
import { projectDetail } from '@/api/project/project';
import { hasPermission } from '@/directives/permission/index';
import BaseCard from '@/views/projects/about/components/base.vue';
import SecurityEditDialog from './../../table-content/components/SecurityEditDialog.vue';
import EditRejectDialog from './../../table-content/components/EditRejectDialog.vue';

const { t } = useI18n();
const route = useRoute();

const pageLoading = ref(false);

const projectUuid = ref('');
const currentId = ref('');

const projectDetailInfo = ref(null);
const securityDetailInfo = ref(null);
const newData = ref(null)
const oldData = ref(null)

const itemDataInfo = computed(() => {
  return {
    process__id: securityDetailInfo.value?.id,
    ...newData.value
  }
})

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
  const res = await dischargeEinfo({ id: currentId.value });
  securityDetailInfo.value = res;
  newData.value = res.data;
  oldData.value = res.data.old__data;
}

const showStatus = computed(() => {
  if (securityDetailInfo.value) {
    if (securityDetailInfo.value.mark === 'security_edit_fc') {
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
        color: 'grey',
        key: 3
      }
    }
  } else {
    return null
  }
})

const securityEditDialogVisible = ref(false)
const rejectVisible = ref(false)
const accept = async () => {
  await dischargeSaveEStep({ uuid: projectUuid.value, id: currentId.value })
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
      .txt-box {
        display: flex;
        align-items: center;
        gap: 2px;
        &.line-info-box {
          gap: 15px;
        }
      }
      :deep(.ant-statistic-content) {
        font-size: 18px !important;
        font-weight: 500 !important;
      }
      :deep(.old .ant-statistic-content) {
        font-size: 12px !important;
        font-weight: normal !important;
        color: #999 !important;
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
        background-color: #f0f0f0;
        border: 1px solid #282828;
        border-radius: 10px;
        padding: 10px 15px;
        margin-top: 10px;
      }
    }
  }
}
</style>