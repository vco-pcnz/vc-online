<template>
  <DetailLayout active-tab="about" ref="detailLayoutRef" @getProjectDetail="getProjectDetail">
    <template #content>
      <div v-if="pageLoading" class="loading-container">
        <a-spin :spinning="pageLoading" size="large"></a-spin>
      </div>
      <vco-template-step type="buy_out" :currentStep="projectInfo?.buyout?.mark" :state="projectInfo?.buyout?.state"></vco-template-step>
      <div v-if="uuid && projectInfo && !pageLoading" class="project-container">
        <div class="project-info">
          <base-card :variations="true" :detail="projectInfo"></base-card>
        </div>
        <div>
          <div class="content sys-form-content" v-if="projectInfo?.buyout?.state <= 0">
            <div class="input-item">
              <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
              <a-date-picker class="datePicker" inputReadOnly :open="isOpen" v-model:value="formState.date" :disabledDate="disabledDateFormat" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" @change="initAmount()" />
            </div>
            <div class="input-item">
              <div class="label">{{ t('Boc总余额') }}</div>
              <a-spin :spinning="initAmount_loading">
                <a-input-number v-model:value="balance" :max="99999999999" :readonly="true" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
              </a-spin>
            </div>
            <div class="input-item">
              <div class="label flex items-end justify-between">
                {{ t('文件') }}
                <vco-upload-modal v-model:list="documentList" v-model:value="formState.document">
                  <a-button class="upload_btn" type="brown" shape="round"> {{ t('上传') }}</a-button>
                </vco-upload-modal>
              </div>

              <div class="file-content">
                <template v-if="documentList.length">
                  <div v-for="(item, index) in documentList" :key="index" class="file-item">
                    <vco-file-item :file="item" :showClose="true" @remove="remove(index)"></vco-file-item>
                  </div>
                </template>
                <p v-if="!documentList.length">{{ t('暂无数据，请上传') }}</p>
              </div>
            </div>
            <div class="input-item">
              <div class="label" :class="{ err: !formState.note && validate }">{{ t('说明') }}</div>
              <a-textarea v-model:value="formState.note" :rows="4" />
            </div>

            <div class="flex justify-center">
              <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
                {{ t('确认') }}
              </a-button>
            </div>
          </div>
          <div>
            <template v-if="(projectInfo?.buyout?.has_permission || hasPermission('projects:about:buyout')) && (projectInfo?.buyout?.cancel_reason || projectInfo?.buyout?.decline_reason) && projectInfo?.buyout?.state > 0">
              <a-alert type="error" :message="t('买断') + ' ' + t('退回原因')" class="mb-5 cancel-reason">
                <template #description>
                  {{ projectInfo?.buyout?.cancel_reason || projectInfo?.buyout?.decline_reason }}
                </template>
              </a-alert>
            </template>
            <template v-if="projectInfo?.buyout?.state > 0">
              <a-alert type="info" class="mb-5">
                <template #description>
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

                    <div v-if="projectInfo?.buyout?.data?.document && projectInfo?.buyout?.data?.document.length">
                      <span class="bold"> {{ t('文件') }}</span>
                      <div v-for="(item, index) in projectInfo?.buyout?.data?.document" :key="index" class="file-item">
                        <vco-file-item :file="item"></vco-file-item>
                      </div>
                    </div>
                    <div>
                      <span class="bold"> {{ t('说明') }}</span
                      >: {{ projectInfo?.buyout?.data?.note || '--' }}
                    </div>
                  </div>
                  <div class="mt-3 flex items-center justify-end">
                    <vco-popconfirm v-if="projectInfo?.buyout?.prev_permission" :tip="t('您确实要撤回该请求吗？')" @update="update()" :formParams="{ uuid: uuid, id: projectInfo?.buyout?.process__id }" url="project/buyout/recall">
                      <a-button type="dark">{{ t('撤回申请') }}</a-button>
                    </vco-popconfirm>
                    <vco-popconfirm v-if="projectInfo?.buyout?.has_permission" :tip="t('您确定要接受该请求吗？')" @update="updateSuc()" :formParams="{ uuid: uuid, id: projectInfo?.buyout?.process__id }" url="project/buyout/saveStep">
                      <a-button type="dark" class="mx-3">{{ t('接受请求') }}</a-button>
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
                      <a-button type="danger">{{ t('退回请求') }}</a-button>
                    </vco-form-dialog>
                  </div>
                </template>
              </a-alert>
            </template>
          </div>
        </div>
      </div>
    </template>
  </DetailLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import DetailLayout from '../components/DetailLayout.vue';
import { buyOutCalculate, buyOutSave } from '@/api/project/buyout';
import { useRoute, useRouter } from 'vue-router';
const router = useRouter();
const route = useRoute();
import BaseCard from '@/views/projects/about/components/base.vue';
import { useI18n } from 'vue-i18n';
import { selectDateFormat } from '@/utils/tool';
import { message } from 'ant-design-vue';
import { hasPermission } from '@/directives/permission/index';
import tool from '@/utils/tool';

const { t } = useI18n();

const pageLoading = ref(false);
const uuid = ref(route.query.uuid);
const projectInfo = ref();

const getProjectDetail = (val) => {
  projectInfo.value = val;
  pageLoading.value = false;
};

// const getProjectDetail = async () => {
//   pageLoading.value = true;
//   const res = await projectDetail({ uuid: uuid.value });
//   pageLoading.value = false;

//   projectInfo.value = res;
// };

const loading = ref(false);
const validate = ref(false);
const formState = ref({
  date: '',
  document: [],
  note: ''
});

const disabledDateFormat = (current) => {
  const startDate = projectInfo.value?.date?.var_start_date;

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  const endDate = projectInfo.value?.date?.end_date;
  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const initAmount_loading = ref(false);
const balance = ref('');
const initAmount = () => {
  initAmount_loading.value = true;
  buyOutCalculate({ date: formState.value.date, uuid: uuid.value })
    .then((res) => {
      balance.value = res.balance;
    })
    .finally((_) => {
      initAmount_loading.value = false;
    });
};

const documentList = ref([]);
// 删除文件
const remove = (index) => {
  documentList.value.splice(index, 1);
};

const save = () => {
  validate.value = true;
  if (!formState.value.date) return message.error(t('请选择') + t('日期'));
  if (!formState.value.note) return message.error(t('请输入') + t('说明'));
  let params = { uuid: uuid.value, ...formState.value };
  if (!Array.isArray(projectInfo.value?.buyout.data)) {
    params.id = projectInfo.value?.buyout.id;
  }
  buyOutSave(params)
    .then((res) => {
      message.success(t('保存成功'));
      detailLayoutRef.value.getProjectDetail();
    })
    .finally((_) => {
      loading.value = false;
    });
};

const detailLayoutRef = ref(null);
const update = () => {
  formState.value = {
    date: '',
    document: [],
    note: ''
  };
  detailLayoutRef.value.getProjectDetail();
};
const updateSuc = () => {
  if (projectInfo.value?.buyout?.mark === 'return_request_director') {
    router.push(`/projects/list`);
    return;
  }
  detailLayoutRef.value.getProjectDetail();
};
onMounted(async () => {
  formState.value = {
    date: '',
    document: [],
    note: ''
  };
  validate.value = false;
});
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
</style>
