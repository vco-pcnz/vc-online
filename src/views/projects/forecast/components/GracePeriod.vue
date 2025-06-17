<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="500" :open="visible" :title="(formState.id ? 'Edit ' : 'Add ') + t('宽限期')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
          <a-date-picker
            class="datePicker"
            :disabledDate="disabledDateFormat"
            inputReadOnly
            v-model:value="formState.date"
            :format="selectDateFormat()"
            valueFormat="YYYY-MM-DD"
            placeholder=""
            :showToday="false"
            :defaultPickerValue="defaultPickerValue"
          />
        </div>

        <div class="input-item">
          <div class="label">Notes</div>
          <a-textarea v-model:value="formState.note" :rows="6" />
        </div>
        <div class="mt-3 gap-3 flex justify-between">
          <p>
            <span class=""> {{ t('利率') }}: </span><span class="fs_xl bold">{{ projectDetail.credit.left.interestRate }}</span
            >%
          </p>
          <p v-if="default_rate">
            <span class="">{{ t('罚息') }} {{ t('利率') }}: </span><span class="fs_xl bold">{{ maxRate ? (14.99 - projectDetail.credit.left.interestRate).toFixed(2) : default_rate }}</span
            >%
          </p>
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
import { ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import tool, { selectDateFormat } from '@/utils/tool';
import { addf } from '@/api/project/loan';
import { systemConfigData } from '@/api/system';
import dayjs, { Dayjs } from 'dayjs';
import { cloneDeep } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: String
  },
  tableData: {
    type: Object
  },
  projectDetail: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const formState = ref({
  id: 0,
  apply_uuid: 0,
  date: '',
  note: '',
  type: 4,
  amount: 0,
  is_grace: 1
});

const defaultPickerValue = computed(() => {
  const startDate = props.projectDetail.loan.end_date;
  return dayjs(startDate).add(2, 'day');
});

const disabledDateFormat = (current) => {
  const startDate = props.projectDetail.loan.end_date;
  if (current && current.isBefore(dayjs(startDate).add(1, 'day'), 'day')) {
    return true;
  }
  return false;
};

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (!formState.value.date) return;

  let params = { ...formState.value, apply_uuid: props.uuid };

  loading.value = true;
  addf(params)
    .then((res) => {
      message.success(t('保存成功'));
      emits('update');
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const default_rate = ref(null);
const loadRate = () => {
  systemConfigData({ pcode: 'project_config', code: 'penalty_rate' }).then((res) => {
    default_rate.value = res.penalty_rate;
  });
};

const init = () => {
  formState.value.date = '';
  formState.value.note = '';

  if (!default_rate.value) loadRate();
  const result = Object.values(props.tableData).flatMap((arr) => arr.filter((i) => i.is_grace === 1));
  if (result.length) {
    formState.value = cloneDeep({
      ...formState.value,
      id: result[0].id,
      date: result[0].date,
      note: result[0].note
    });
  }
  visible.value = true;
};

const maxRate = computed(() => {
  if (!formState.value.date) return false;
  const d1 = dayjs(props.projectDetail.loan.end_date).startOf('day');
  const d2 = dayjs(formState.value.date).startOf('day');

  // 计算绝对天数差
  const diffDays = Math.abs(d1.diff(d2, 'day'));
  if (diffDays <= 15) return true;
});
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
