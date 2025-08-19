<template>
  <div>
    <div class="inline" @click="init"><slot></slot></div>
    <div @click.stop ref="JournalRef" class="Journal">
      <a-modal :width="550" :open="visible" :title="t('添加记录')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
        <div class="content sys-form-content">
          <div class="input-item">
            <div class="label" :class="{ err: !formState.type && validate }">{{ t('类型') }}</div>
            <a-select :loading="loading_type" style="width: 100%" v-model:value="formState.type" :options="types" :fieldNames="{ label: 'name', value: 'code' }"></a-select>
          </div>
          <div class="input-item">
            <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
            <a-date-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly v-model:value="formState.date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" :showToday="false" />
          </div>

          <div class="input-item" v-if="formState.type != 3">
            <div class="label" :class="{ err: !formState.amount && validate }">{{ t('金额，新西兰元') }}</div>
            <a-input-number v-model:value="formState.amount" :min="0" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
          </div>

          <template v-if="formState.type == 3">
            <div class="flex gap-5">
              <div class="input-item">
                <div class="label" :class="{ err: !formState.rate && validate }">{{ t('利率') }}</div>
                <a-input-number class="rate" v-model:value="formState.rate" addon-after="%" :min="0" :max="100" style="width: 100%"></a-input-number>
              </div>
              <div class="input-item">
                <div class="label">{{ t('浮动利率') }}</div>
                <a-input-number class="rate" v-model:value="formState.frate" addon-after="%" :min="0" :max="100" style="width: 100%"></a-input-number>
              </div>
            </div>
            <div class="input-item">
              <div class="label">{{ t('生成Line fee') }}</div>
              <a-switch v-model:checked="formState.do_linefee" />
            </div>

            <div class="input-item" v-if="formState.do_linefee">
              <div class="label" :class="{ err: !formState.lrate && validate }">{{ t('Line Fee 费率') }}</div>
              <a-input-number class="rate" v-model:value="formState.lrate" addon-after="%" :min="0" :max="100" style="width: 100%"></a-input-number>
            </div>
          </template>

          <div class="input-item" v-if="formState.type != 3">
            <div class="label">{{ t('说明') }}</div>
            <a-textarea v-model:value="formState.note" :rows="4" />
          </div>

          <div class="flex justify-center">
            <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
              {{ t('确认') }}
            </a-button>
          </div>
        </div>
      </a-modal>
    </div>
  </div>
</template>

<script scoped setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { cloneDeep } from 'lodash';
import { systemDictData } from '@/api/system';
import { selectDateFormat } from '@/utils/tool';
import { scheduleEdit, scheduleInfo } from '@/api/invest/index';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  invest_id: {
    type: [String, Number]
  },
  use_date: {
    type: String
  },
  formParams: {
    type: Object,
    default: {}
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  type: '',
  date: '',
  amount: '',
  do_linefee: false,
  rate: '',
  frate: 0,
  lrate: '',
  note: ''
});

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (!formState.value.date || !formState.value.type) {
    return;
  }

  let params = cloneDeep(formState.value);
  params.do_linefee = formState.value.do_linefee ? 1 : 0;
  params.invest_id = props.invest_id;
  if (params.type != 3) {
    params.rate = '';
    params.frate = '';
    params.lrate = '';
    if (formState.value.amount <= 0) {
      return;
    }
  } else {
    if (!formState.value.rate) {
      return;
    }
    if (!params.do_linefee) {
      params.lrate = '';
    } else {
      if (!formState.value.lrate) {
        return;
      }
    }
    params.amount = '';
    params.note = '';
  }
  loading.value = true;
  scheduleEdit(params)
    .then((res) => {
      emits('update');
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const loading_type = ref(false);
const types = ref([]);
const loadType = () => {
  loading_type.value = true;
  systemDictData('invest_type')
    .then((res) => {
      types.value = res || [];
    })
    .finally((_) => {
      loading_type.value = false;
    });
};

const loadInfo = () => {
  scheduleInfo({ id: props.invest_id }).then((res) => {
    formState.value.frate = res.frate;
    formState.value.lrate = res.lrate;
    formState.value.rate = res.rate;
  });
};

const disabledDateFormat = (current) => {
  const startDate = props.use_date;

  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  const endDate = new Date();
  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const init = () => {
  validate.value = false;
  formState.value = {
    type: '',
    date: '',
    amount: '',
    do_linefee: false,
    rate: '',
    frate: 0,
    lrate: '',
    note: ''
  };
  loadInfo();
  loadType();
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

    .ant-input-number-group .ant-input-number-group-addon {
      border-start-end-radius: 10px;
      border-end-end-radius: 10px;
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
