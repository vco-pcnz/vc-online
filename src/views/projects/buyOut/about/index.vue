<template>
  <DetailLayout active-tab="about" ref="detailLayoutRef" @getProjectDetail="getProjectDetail">
    <template #content>
      <div v-if="pageLoading" class="loading-container">
        <a-spin :spinning="pageLoading" size="large"></a-spin>
      </div>
      <vco-template-step type="buy_out" :currentStep="projectInfo?.buyout?.mark" :state="projectInfo?.buyout?.state">
        <vco-popconfirm v-if="hasPermission('projects:buyOut:return') && projectInfo?.buyout?.state == 1000" :tip="t('确定要退回吗？')" @update="returnHandle" :formParams="{ uuid: uuid}" url="project/buyout/buyoutDecline">
          <a-button type="dark" class="big shadow bold uppercase ml-5">{{ t('退回') }}</a-button>
        </vco-popconfirm>
      </vco-template-step>
      <div v-if="uuid && projectInfo && !pageLoading" class="project-container">
        <div class="project-info">
          <base-card :variations="true" :detail="projectInfo"></base-card>
        </div>
        <div>
          <template v-if="(projectInfo?.buyout?.has_permission || hasPermission('projects:about:buyout')) && (projectInfo?.buyout?.cancel_reason || projectInfo?.buyout?.decline_reason) && projectInfo?.buyout?.state > 0">
            <a-alert type="error" :message="t('买断') + ' ' + t('退回原因')" class="mb-5 cancel-reason">
              <template #description>
                {{ projectInfo?.buyout?.cancel_reason || projectInfo?.buyout?.decline_reason }}
              </template>
            </a-alert>
          </template>
          <div class="buyout-info" v-if="projectInfo?.buyout?.state > 0">
            <div v-if="projectInfo?.buyout?.data?.note">
              <div>
                <span class="bold"> {{ t('日期') }}</span
                >:
                <span>{{ tool.showDate(projectInfo?.buyout?.data?.date) }}</span>
              </div>
              <div>
                <span class="bold"> {{ t('BOC放款金额') }}</span
                >:
                <span class="fs_xl colorPrimary">{{ tool.formatMoney(projectInfo?.buyout?.data?.drawdown_amount) }}</span>
              </div>
              <div>
                <span class="bold"> {{ t('BOC还款金额') }}</span
                >:                      
                <span class="fs_xl colorPrimary">{{ tool.formatMoney(Math.abs(projectInfo?.buyout?.data?.repayment_amount)) }}</span>
              </div>
              <div>
                <span class="bold"> {{ t('买断利息') }}</span
                >:
                <span class="fs_xl colorPrimary">{{ tool.formatMoney(projectInfo?.buyout?.data?.interest) }}</span>
              </div>

              <div>
                <span class="bold"> {{ t('Boc总余额') }}</span
                >:
                <span class="fs_xl colorPrimary">{{ tool.formatMoney(projectInfo?.buyout?.data?.amount) }}</span>
              </div>

              
              <div>
                <span class="bold"> {{ t('说明') }}</span
                >: {{ projectInfo?.buyout?.data?.note || '--' }}
              </div>
            </div>

            <div class="table-content sys-table-content related-content no-top-line Repayment_allocation">
              <a-table rowKey="uuid" :columns="DrawdownColumns" :data-source="projectInfo?.buyout?.data?.buyout" :pagination="false" table-layout="fixed" :scroll="{ y: 300 }">
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'name'">
                    <p :title="record.name" class="sec-name">{{ record.name }}</p>
                  </template>
                  <template v-if="column.dataIndex === 'amount'">
                    <div class="text-center">
                      <vco-number size="fs_md" :value="record.interest_status==1?tool.minus(record.amount,record.reality_interest):tool.minus(record.amount,record.interest)" :precision="2"></vco-number>
                      <div class="flex justify-center items-center gap-1">
                        <vco-number style="opacity: 0.6" size="fs_md" :value="record.interest" :precision="2"></vco-number> 
                      </div>
                    </div>
                  </template>
                  <template v-if="column.dataIndex === 'reality_interest'">
                    <div class="flex justify-center items-center gap-1" v-if="record.interest_status == 1 && record.sn">
                      {{ tool.formatMoney(record.reality_interest) }}
                    </div>
                    <div v-else></div>
                  </template>
                  <template v-if="column.dataIndex === 'all_repayment'">
                    {{ t('全额还款') }}
                  </template>

                  <template v-if="column.dataIndex === 'amount1'">
                    {{ tool.formatMoney(record.amount) }}
                  </template>
                </template>
              </a-table>
            </div>
            <div v-if="projectInfo?.buyout?.data?.document && projectInfo?.buyout?.data?.document.length">
                <span class="bold"> {{ t('文件') }}</span>
                <div v-for="(item, index) in projectInfo?.buyout?.data?.document" :key="index" class="file-item">
                  <vco-file-item :file="item"></vco-file-item>
                </div>
              </div>

            <div class="mt-5 flex items-center justify-center">
              <vco-popconfirm v-if="projectInfo?.buyout?.prev_permission" :tip="t('您确实要撤回该请求吗？')" @update="update()" :formParams="{ uuid: uuid, id: projectInfo?.buyout?.process__id }" url="project/buyout/recall">
                <a-button type="dark" size="large">{{ t('撤回申请') }}</a-button>
              </vco-popconfirm>
              <vco-popconfirm v-if="projectInfo?.buyout?.has_permission" :tip="t('您确定要接受该请求吗？')" @update="updateSuc()" :formParams="{ uuid: uuid, id: projectInfo?.buyout?.process__id }" url="project/buyout/saveStep">
                <a-button type="dark" class="mx-3" size="large">{{ t('接受请求') }}</a-button>
              </vco-popconfirm>
              <vco-form-dialog
                v-if="projectInfo?.buyout?.has_permission"
                :title="t('退回请求')"
                :initData="[
                  {
                    type: 'textarea',
                    label: '原因',
                    key: 'cancel_reason',
                    required: true
                  }
                ]"
                :formParams="{ uuid: projectInfo?.buyout?.data?.uuid || uuid, id: projectInfo?.buyout?.process__id }"
                url="project/buyout/goBack"
                @update="update"
              >
                <a-button type="danger" size="large">{{ t('退回请求') }}</a-button>
              </vco-form-dialog>
            </div>
          </div>
        </div>
      </div>
    </template>
  </DetailLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import DetailLayout from '../components/DetailLayout.vue';
import { buyOutCalculate, buyOutSave } from '@/api/project/buyout';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();
import BaseCard from '@/views/projects/about/components/base.vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
import { hasPermission } from '@/directives/permission/index';
import tool, { navigationTo } from '@/utils/tool';

const { t } = useI18n();

const pageLoading = ref(false);
const uuid = ref(route.query.uuid);
const projectInfo = ref();

const getProjectDetail = (val) => {
  projectInfo.value = val;
  if (projectInfo.value?.buyout?.state <= 0) {
    navigationTo(`/projects/about?uuid=${uuid.value}`);
  }
  pageLoading.value = false;
};

const detailLayoutRef = ref(null);
const update = () => {
  detailLayoutRef.value.getProjectDetail();
};
const updateSuc = () => {
  if (projectInfo.value?.buyout?.mark === 'return_request_director') {
    router.push(`/projects/list`);
    return;
  }
  detailLayoutRef.value.getProjectDetail();
};

const showRealityInterestColumn = computed(() => {
  return projectInfo.value?.buyout?.data?.buyout?.some((item) => Number(item.interest_status) === 1);
});

const DrawdownColumns = computed(() => {
  const base = [
    { title: t('账号'), dataIndex: 'name' },
    { title: t('本金/利息'), dataIndex: 'amount', width: 160, align: 'center' },
    ...(showRealityInterestColumn.value
      ? [{ title: t('实际利息'), dataIndex: 'reality_interest', width: 170 }]
      : []),
    {
      title: t('还款方式'),
      dataIndex: 'all_repayment',
      width: showRealityInterestColumn.value ? 160 : 180,
    },
    {
      title: t('还款金额1'),
      dataIndex: 'amount1',
      align: 'center',
      width: showRealityInterestColumn.value ? 160 : 180,
    },
  ];
  return base
});

const returnHandle = () => {
  router.push(`/projects/about?uuid=${uuid.value}`);
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

  .sys-form-content {
    padding: 20px 30px;
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid @clr_white;
    background-color: @clr_white;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
  }

  :deep(.ant-input[disabled]),
  :deep(.ant-input-number-disabled input) {
    color: #999 !important;
  }
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.plus-txt {
  position: relative;
  .iconfont {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #282828;
    font-weight: bold;
    font-size: 18px;
  }
}

.input-number-container {
  height: 50px;
  display: flex;
  align-items: center;
  position: relative;
  .iconfont {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    color: @colorPrimary;
    font-weight: bold;
    font-size: 18px;
  }
}

.line-content {
  width: 100%;
  border-top: 1px dashed #808080;
}
.file-content {
  border: 1px solid #272727 !important;
  border-radius: 10px !important;
  background-color: #f7f9f8;
  padding: 15px;
  > p {
    text-align: center;
    font-size: 14px;
    color: #999;
  }
}
.input-item {
  margin-bottom: 30px;
  .label {
    color: #888;
    font-size: 12px;
    padding: 0 0 8px;
    &.err {
      color: #c1430c;
    }
  }
}

.related-content {
    padding: 10px;
    border: 1px solid #272727 !important;
    border-radius: 10px !important;
    margin-bottom: 24px;
    background: #fff;
    margin-top: 10px;

    :deep(.ant-empty) {
      min-height: 50px !important;
      margin: 0 !important;
    }

    :deep(.remove-icon) {
      cursor: pointer;
      color: #ea3535 !important;

      &:hover {
        color: #f24f4f !important;
      }
    }

    &.drawdownListInspection {
      border-color: #ff7875 !important;
    }
  }

  .sec-name {
    white-space: nowrap; /* 禁止换行 */
    overflow: hidden; /* 隐藏溢出内容 */
    text-overflow: ellipsis; /* 使用省略号表示溢出内容 */
  }

  .buyout-info {
    border-radius: 12px;
    border: 1px solid #FBFBFB;
    background-color: #fff;
    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.1);
    padding: 20px 20px 50px;
  }

</style>
