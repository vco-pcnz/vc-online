<template>
  <div>
    <!-- 编辑弹窗 -->
    <security-edit-dialog
      v-model:visible="securityEditDialogVisible"
      :uuid="projectUuid"
      :projectDetail="projectDetailInfo"
      :infoData="securityDetailInfo"
      :re-edit="true"
      @done="pageInit"
    ></security-edit-dialog>

    <add-reject-dialog
      v-model:visible="rejectVisible"
      :p_uuid="projectUuid"
      :uuid="securityDetailInfo?.uuid"
      @done="pageInit"
    />

    <vco-page-panel :title="$t('添加详情')" @back="goBack">
      <div
        v-if="((hasPermission('projects:securities:add:check') || hasPermission('projects:securities:aer'))) && Number(securityDetailInfo?.state) !== 1000"
          class="flex justify-end items-center gap-5">
        <a-button
          v-if="hasPermission('projects:securities:add:check') && showStatus?.key === 1"
          type="danger"
          @click="rejectVisible = true"
        >{{ t('拒绝请求') }}</a-button>
        <a-popconfirm
          v-if="hasPermission('projects:securities:add:check') && showStatus?.key === 1"
          :title="t('您确定要接受该请求吗？')"
          @confirm="accept"
        >
          <a-button
            type="primary"
          >{{ t('审核') }}</a-button>
        </a-popconfirm>
        <a-button
          v-if="hasPermission('projects:securities:aer') && showStatus?.key === 2"
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
                  v-if="Boolean(securityDetailInfo?.state2_decline_reason)"
                  :message="t('拒绝原因')"
                  :description="securityDetailInfo?.state2_decline_reason"
                  type="error"
                  class="mt-2"
                />
              </a-col>
              <a-col :span="18" class="item-txt">
                <p class="name">{{ t('名称') }}</p>
                <p class="txt">{{ securityDetailInfo?.security_name }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('类型') }}</p>
                <p class="txt">{{ securityDetailInfo?.type_name }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('抵押物价值') }}</p>
                <vco-number :value="securityDetailInfo?.amount" :precision="2"></vco-number>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('保险价值') }}</p>
                <vco-number :value="securityDetailInfo?.insurance_value" :precision="2"></vco-number>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('产权编号') }}</p>
                <p class="txt">{{ securityDetailInfo?.card_no }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('抵押登记日期') }}</p>
                <p class="txt">{{ securityDetailInfo?.mortgage_registration_date ? tool.showDate(securityDetailInfo?.mortgage_registration_date) : '--' }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('保险到期日') }}</p>
                <p class="txt">{{ securityDetailInfo?.insurance_expire_date ? tool.showDate(securityDetailInfo?.insurance_expire_date) : '--' }}</p>
              </a-col>
              <a-col :span="6" class="item-txt">
                <p class="name">{{ t('担保公司') }}</p>
                <p class="txt">{{ securityDetailInfo?.insurance_company || '--' }}</p>
              </a-col>
              <a-col :span="24" class="item-txt">
                <p class="name">{{ t('地址') }}</p>
                <p class="txt">{{ securityDetailInfo?.city || '--' }}</p>
              </a-col>
              <a-col :span="24" class="item-txt">
                <p class="name">{{ t('备注') }}</p>
                <p class="txt">{{ securityDetailInfo?.remark || '--' }}</p>
              </a-col>
              <a-col v-if="houseInfo.length" :span="24" class="item-txt">
                <p class="name">{{ t('房屋信息') }}</p>
                <div class="content">
                  <div class="item">
                    <vco-number :value="securityDetailInfo?.sqm" :precision="2" prefix="" suffix="㎡" class="number"></vco-number>
                  </div>
                  <div class="item" v-for="item in houseInfo" :key="item.name">
                    <vco-number :value="item.value" :precision="0" prefix="" class="number"></vco-number>
                    <p class="name">{{ item.name }}</p>
                  </div>
                </div>
              </a-col>
              <a-col v-if="Number(securityDetailInfo?.is_sales || 0) === 1" :span="24" class="item-txt">
                <p class="name">{{ t('预售信息') }}</p>
                <div class="info-content">
                  <a-row :gutter="24">
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('含消费税') }}</p>
                      <p class="txt" v-if="Number(securityDetailInfo?.is_gst) === 1">{{ t('包含') }}</p>
                      <p class="txt" v-else>{{ t('不包含') }}</p>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('销售价格') }}</p>
                      <vco-number :value="securityDetailInfo?.sales_price" :precision="2"></vco-number>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('回款金额') }}</p>
                      <vco-number :value="securityDetailInfo?.repayment_price" :precision="2"></vco-number>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('合同日期') }}</p>
                      <p class="txt">{{ securityDetailInfo?.contract_date ? tool.showDate(securityDetailInfo?.contract_date) : '--' }}</p>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('结算日期') }}</p>
                      <p class="txt">{{ securityDetailInfo?.settlement_date ? tool.showDate(securityDetailInfo?.settlement_date) : '--' }}</p>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('日落日期') }}</p>
                      <p class="txt">{{ securityDetailInfo?.sunset_date ? tool.showDate(securityDetailInfo?.sunset_date) : '--' }}</p>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('还款日期') }}</p>
                      <p class="txt">{{ securityDetailInfo?.repayment_date ? tool.showDate(securityDetailInfo?.repayment_date) : '--' }}</p>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('净收益') }}</p>
                      <vco-number :value="securityDetailInfo?.net_proceeds_price" :precision="2"></vco-number>
                    </a-col>
                    <a-col :span="6" class="item-txt">
                      <p class="name">{{ t('变化比例') }}</p>
                      <vco-number :value="securityDetailInfo?.variance" :precision="2" suffix="%" prefix=""></vco-number>
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
import { dischargeInfo, dischargeSaveDStep } from '@/api/project/loan';
import { projectDetail } from '@/api/project/project';
import { hasPermission } from '@/directives/permission/index';
import BaseCard from '@/views/projects/about/components/base.vue';
import { cloneDeep } from 'lodash';
import SecurityEditDialog from './../../table-content/components/SecurityEditDialog.vue';
import AddRejectDialog from './../../table-content/components/AddRejectDialog.vue';

const { t } = useI18n();
const route = useRoute();

const pageLoading = ref(false);

const projectUuid = ref('');
const securityUuid = ref('');

const projectDetailInfo = ref(null);
const securityDetailInfo = ref(null);

// 获取项目详情
const getProjectDetail = async () => {
  const res = await projectDetail({ uuid: projectUuid.value });
  projectDetailInfo.value = res;
}

// 获取抵押物详情
const getSecurityDetail = async () => {
  const res = await dischargeInfo({ uuid: securityUuid.value });
  securityDetailInfo.value = res;
}

const showStatus = computed(() => {
  if (securityDetailInfo.value) {
    if (securityDetailInfo.value.mark === 'security_fc') {
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

const houseInfo = computed(() => {
  if (securityDetailInfo.value && Number(securityDetailInfo.value.type || 0) === 2) {
    const obj = cloneDeep(securityDetailInfo.value.typology)
    const arr = []
    for (const key in obj) {
      if (key !== 'other') {
        arr.push({
          name: key,
          value: obj[key]
        })
      } else {
        if (obj.other && obj.other.length > 0) {
          obj.other.forEach(item => {
            arr.push({
              name: item.key,
              value: item.value
            })
          })
        }
      }
    }
    return arr;
  } else {
    return [];
  }
})

const securityEditDialogVisible = ref(false)
const rejectVisible = ref(false)
const accept = async () => {
  await dischargeSaveDStep({ p_uuid: projectUuid.value, uuid: securityUuid.value })
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
  const uuid = route.query.uuid;
  if (p_uuid && uuid) {
    projectUuid.value = p_uuid;
    securityUuid.value = uuid;

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
      > p {
        font-size: 13px;
        &.name {
          color: #999;
          margin-bottom: 3px;
        }
        &.txt {
          font-size: 18px;
          font-weight: 500;
          color: #181818;
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