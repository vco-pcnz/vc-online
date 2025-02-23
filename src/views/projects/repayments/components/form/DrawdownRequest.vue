<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal
      :width="700"
      :open="visible"
      :title="t('还款申请')"
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
          :rules="formRules"
        >
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item :label="t('还款标题')" name="name">
                <a-input v-model:value="formState.name" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('还款方式')" name="all_repayment">
                <a-select
                  v-model:value="formState.all_repayment"
                  @change="typeChange"
                >
                  <a-select-option :value="0">{{ t('部分还款') }}</a-select-option>
                  <a-select-option :value="1">{{ t('全额还款') }}</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('还款日期')" name="apply_date">
                <a-date-picker
                  v-model:value="formState.apply_date"
                  :format="selectDateFormat()"
                  :disabledDate="disabledDateFormat"
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
            <a-col :span="12">
              <a-form-item :label="t('还款金额')" name="apply_amount">
                <a-input-number
                  v-model:value="formState.apply_amount"
                  :disabled="formState.all_repayment === 1"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <a-form-item :label="t('还款说明')" name="note">
                <a-textarea v-model:value="formState.note" :placeholder="t('请输入')" :rows="3" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <documents-upload v-model:value="document">
                <div class="upload-title">{{ t('文件') }}</div>
              </documents-upload>
            </a-col>
          </a-row>
        </a-form>
        
        <div class="flex justify-center mt-5">
          <a-button @click="save" type="dark" class="save big uppercase shadow bold" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { loanRDedit, projectLoanAllRepayment } from '@/api/project/loan';
import { CalendarOutlined } from '@ant-design/icons-vue';
import DocumentsUpload from './../../../discharge/components/form/DocumentsUpload.vue';
import dayjs from 'dayjs';
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
const loading = ref(false);

const formState = ref({
  name: '',
  all_repayment: '',
  apply_date: '',
  apply_amount: '',
  note: ''
});

const document = ref([])

const formRef = ref()

const formRules = ref({
  name: [
    { required: true, message: t('请输入') + t('还款标题'), trigger: 'blur' },
  ],
  all_repayment: [
    { required: true, message: t('请选择') + t('还款方式'), trigger: 'change' },
  ],
  apply_date: [
    { required: true, message: t('请选择') + t('还款日期'), trigger: 'change' },
  ],
  apply_amount: [
    { required: true, message: t('请输入') + t('还款金额'), trigger: 'blur' },
  ]
});

const updateVisible = (value) => {
  visible.value = value;

  if (!value) {
    formRef.value.clearValidate();
    formRef.value.resetFields();
    Object.keys(formState.value).forEach((key) => {
      formState.value[key] = ''; // 清空每个字段
    });
  }
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = {
        ...formState.value,
        apply_date: dayjs(formState.value.apply_date).format('YYYY-MM-DD'),
        uuid: props.uuid,
        document: document.value
      }
      loading.value = true

      loanRDedit(params).then(() => {
        loading.value = false
        updateVisible(false)
        emits('change')
      }).catch(() => {
        loading.value = false
      })
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const getLoading = ref(false)

const disabledDateFormat = (current) => {
  const startDate = dayjs()
  const endDate = props?.projectDetail?.date?.end_date

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
}

const calAmount = () => {
  getLoading.value = true

  const time = dayjs(formState.value.apply_date).format('YYYY-MM-DD')
  projectLoanAllRepayment({
    uuid: props.uuid,
    date: time
  }).then(res => {
    formState.value.apply_amount = res ? Number(res) : 0
    getLoading.value = false
  }).catch(() => {
    getLoading.value = false
  })
}

const dateChange = (date) => {
  if (date && formState.value.all_repayment === 1) {
    calAmount()
  } else {
    formState.value.apply_amount = 0
  }
}

const typeChange = () => {
  if (formState.value.apply_date && formState.value.all_repayment === 1) {
    calAmount()
  } else {
    formState.value.apply_amount = 0
  }
}

const init = () => {
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.drawdown-request {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 40px 40px 24px;
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
  :deep(.ant-input-number-disabled ) {
    color: #282828 !important;
  }
}
</style>
