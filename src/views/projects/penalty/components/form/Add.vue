<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="550" :open="visible" :title="t('罚息开始')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.start_date && validate }">{{ t('开始时间') }}</div>
          <a-date-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly v-model:value="formState.start_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" />
        </div>
        <div class="input-item">
          <div class="label">{{ t('结束时间') }}</div>
          <a-date-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly v-model:value="formState.end_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" />
        </div>

        <div class="input-item">
          <div class="label" :class="{ err: !formState.rate && validate }">{{ t('利率') }}</div>
          <a-input-number  class="rate" v-model:value="formState.rate" addon-after="%" :min="0" :max="100" style="width: 100%"></a-input-number>
        </div>
        <div class="input-item">
          <div class="label">{{ t('描述') }}</div>
          <a-textarea v-model:value="formState.note" placeholder="Basic usage" :rows="6" />
        </div>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('确认') }}
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
import { sedit } from '@/api/project/penalty';
import { systemConfigData } from '@/api/system';
import { pick } from 'lodash';
import { selectDateFormat } from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  currentId: {
    type: String,
    default: ''
  },
  projectDetail: {
    type: Object
  },
  detail: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  uuid: '',
  start_date: '',
  end_date: '',
  rate: '',
  note: ''
});

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  formState.value.uuid = props.currentId;
  validate.value = true;
  if (!formState.value.start_date || !formState.value.rate) return;
  if (formState.value.end_date && new Date(formState.value.start_date) >= new Date(formState.value.end_date)) {
    return message.error(t('结束时间不能大于开始时间'));
  }
  sedit(formState.value)
    .then((res) => {
      emits('update');
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const loadRate = () => {
  systemConfigData({ pcode: 'project_config', code: 'penalty_rate' }).then((res) => {
    formState.value.rate = res.penalty_rate;
  });
};

const disabledDateFormat = (current) => {
  const startDate = props.projectDetail?.date.start_date;
  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  return false;
};

const init = () => {
  if (!props.detail) {
    formState.value = {
      uuid: '',
      start_date: '',
      end_date: '',
      rate: '',
      note: ''
    };
    loadRate();
  } else {
    let keys = ['id', 'start_date', 'end_date', 'rate', 'note'];
    formState.value = pick(props.detail, keys);
  }
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
        margin-top: 24px;
      }
    }
  }

  .input-item {
    margin-top: 20px;
  }
}
</style>
