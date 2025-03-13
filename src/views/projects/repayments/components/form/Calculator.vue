<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal
      :width="500"
      :open="visible"
      :title="t('还款计算器')"
      :getContainer="() => $refs.drawdownRequestRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <a-form
          ref="formRef"
          layout="vertical"
          :model="formState"
        >
          <a-row :gutter="24">
            <a-col :span="24" class="mb-5">
              <a-alert type="info">
                <template #message>
                  <p class="text-sm">{{ t('选择还款时间可计算出全额还款所需金额') }}</p>
                </template>
              </a-alert>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('还款日期')" name="date">
                <a-date-picker
                  v-model:value="formState.date"
                  :disabledDate="disabledDateFormat"
                  :format="selectDateFormat()"
                  placeholder=""
                  @change="dateChange"
                >
                  <template #suffixIcon>
                    <a-spin v-if="getLoading"></a-spin>
                    <CalendarOutlined v-else />
                  </template>
                </a-date-picker>
              </a-form-item>
            </a-col>
            <a-col v-if="totalAmount" :span="24">
              <a-form-item :label="t('还款总额')">
                <vco-number :bold="true" :value="totalAmount" :precision="2" :end="true"></vco-number>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import { CalendarOutlined } from '@ant-design/icons-vue';
import { projectLoanAllRepayment } from '@/api/project/loan';
import { selectDateFormat } from "@/utils/tool"

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  uuid: {
    type: String
  },
  projectDetail: {
    type: Object,
    default: () => {}
  }
});

const visible = ref(false);

const formRef = ref()
const formState = ref({
  date: ''
});

const disabledDateFormat = (current) => {
  const startDate = dayjs()
  // const endDate = props?.projectDetail?.date?.end_date

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  // if (current && current.isAfter(endDate, 'day')) {
  //   return true;
  // }

  return false;
}

const totalAmount = ref(0)
const getLoading = ref(false)
const dateChange = (date) => {
  if (date) {
    const time = dayjs(date).format('YYYY-MM-DD')
    getLoading.value = true

    projectLoanAllRepayment({
      uuid: props.uuid,
      date: time
    }).then(res => {
      totalAmount.value = res ? Number(res) : 0
      getLoading.value = false
    }).catch(() => {
      getLoading.value = false
    })
  } else {
    totalAmount.value = 0
  }
}

const updateVisible = (value) => {
  visible.value = value;

  if (!value) {
    formRef.value.clearValidate();
    formRef.value.resetFields();
    Object.keys(formState.value).forEach((key) => {
      formState.value[key] = ''; // 清空每个字段
    });

    totalAmount.value = 0
  }
};

const init = () => {
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.drawdown-request {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 40px 40px 0;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 40px 40px;
      .save {
        margin-top: 24px;
      }
    }
  }
}

.sys-form-content {
  :deep(.textarea) {
    height: 154px !important;
  }
}
</style>
