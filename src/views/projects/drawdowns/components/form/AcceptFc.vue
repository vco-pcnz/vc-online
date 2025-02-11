<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="486" :open="visible" title="Accept documents" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !date && validate }">{{ t('日期') }}</div>
          <a-date-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly v-model:value="date" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" :showToday="false" />
        </div>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool from '@/utils/tool';
import { loanDsaveStep } from '@/api/project/loan';
import dayjs, { Dayjs } from 'dayjs';

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
const validate = ref(false);

const date = ref('');


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
  validate.value = true;
  if (!date.value) return message.error(t('请输入') + t('日期'));
  loading.value = true;
  let params = {
    uuid: props.uuid,
    id: props.detail.id,
    date: date.value
  };
  loanDsaveStep(params)
    .then((res) => {
      date.value = '';
      message.success(t('保存成功'));
      emits('change');
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const init = () => {
  date.value =  dayjs().format('YYYY-MM-DD');
  visible.value = true;
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
      .label {
        color: #888;
        font-size: 12px;
        padding: 0 0 8px;
        &.err {
          color: #c1430c;
        }
      }

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
