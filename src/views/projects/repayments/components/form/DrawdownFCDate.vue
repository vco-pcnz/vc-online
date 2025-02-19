<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="486" :open="visible" :title="t('接受请求')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form
          ref="formRef"
          layout="vertical"
          :model="formState"
          :rules="formRules"
        >
          <a-form-item :label="t('日期')" name="date">
            <a-date-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly v-model:value="formState.date" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" :showToday="false" />
          </a-form-item>
        </a-form>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('保存') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { loanRsaveStep } from '@/api/project/loan';
import dayjs from 'dayjs';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  uuid: {
    type: String
  },
  detail: {
    type: Object
  },
  projectDetail: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);

const formState = ref({
  date: '',
});

const formRef = ref()
const formRules = ref({
  date: [
    { required: true, message: t('请选择') + t('日期'), trigger: 'change' },
  ]
});

const disabledDateFormat = (current) => {
  const startDate = props.projectDetail.loan.start_date
  const endDate = props.projectDetail.loan.end_date

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = {
        ...formState.value,
        uuid: props.uuid,
        id: props.detail.id
      }
      loading.value = true

      loanRsaveStep(params).then(() => {
        loading.value = false
        visible.value = false
        emits('change')
      }).catch(() => {
        loading.value = false
      })
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const init = () => {
  visible.value = true;

  nextTick(() => {
    formRef.value.clearValidate();
    formRef.value.resetFields();

    formState.value.date = props.detail.apply_date ? dayjs(props.detail.apply_date).format('YYYY-MM-DD') :  dayjs().format('YYYY-MM-DD');
  })
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 0px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 84px 72px;

      .save {
        width: 100%;
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
