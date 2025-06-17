<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="486" :open="visible" :title="(formState.id ? 'Edit' : 'Add') + ' forecast item'" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.type && validate }">{{ t('类型') }}</div>
          <a-select v-model:value="formState.type" style="width: 100%">
            <a-select-option :value="2">{{ t('放款') }}</a-select-option>
            <a-select-option :value="4">{{ t('还款') }}</a-select-option>
          </a-select>
        </div>

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
          <div class="label" :class="{ err: formState.amount === '' && validate }">{{ t('金额') }}</div>
          <a-input-number v-model:value="formState.amount" :min="0" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
        </div>

        <div class="input-item">
          <div class="label">Notes</div>
          <a-textarea v-model:value="formState.note" :rows="6" />
        </div>

        <div class="flex justify-center">
          <a-button @click="setShowTip" type="dark" class="save big uppercase" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>

    <!-- 提示弹窗 -->
    <a-modal :open="tipsVisible" :title="t('修改方式')" :width="460" :footer="null" :keyboard="false" :maskClosable="false" @cancel="tipsVisible = false">
      <div class="tips-content">
        <a-radio-group v-model:value="formState.change">
          <a-radio :value="2" class="mt-4"
            ><p class="tips-txt">{{ t('仅修改当前项，其他日期的放款信息不变') }}</p></a-radio
          >
          <a-radio :value="1" class="mt-4"
            ><p class="tips-txt">{{ t('{0}以后已手动修改的放款信息，保留已设置的值', [tool.showDate(formState.date)]) }}</p></a-radio
          >
          <a-radio :value="0" class="mt-4"
            ><p class="tips-txt">{{ t('{0}以后已手动修改的放款信息，按照比例均分', [tool.showDate(formState.date)]) }}</p></a-radio
          >
        </a-radio-group>

        <div class="mt-5 flex justify-between gap-5">
          <a-button type="grey" class="big shadow bold uppercase w-full mb-5 mt-5" @click="tipsVisible = false">{{ t('取消') }}</a-button>

          <a-button type="dark" class="big shadow bold uppercase w-full mb-5 mt-5" :loading="loading" @click="save">{{ t('提交') }}</a-button>
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
import { projectVariationAddf } from '@/api/project/variation';
import dayjs, { Dayjs } from 'dayjs';
import { cloneDeep } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: String
  },
  itemId: {
    type: [String, Number]
  },
  projectDetail: {
    type: Object
  },
  itemDate: {
    type: Object
  }
});

const tipsVisible = ref(false);

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const formState = ref({
  id: 0,
  apply_uuid: 0,
  type: 2,
  date: '',
  amount: '',
  change: 2,
  note: ''
});

const defaultPickerValue = computed(() => {
  const startDate = props.itemId ? props.projectDetail.variationInfo.start_date : props.projectDetail.loan.start_date;
  return dayjs(startDate).add(1, 'day');
});

const disabledDateFormat = (current) => {
  const startDate = props.itemId ? props.projectDetail.variationInfo.start_date : props.projectDetail.loan.start_date;
  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }
  if (formState.value.type == '4') {
    const endDate = props.projectDetail.loan.end_date;
    if (formState.value.date && dayjs(formState.value.date).isAfter(dayjs(endDate))) {
      formState.value.date = '';
    }
    if (current && current.isAfter(endDate, 'day')) {
      return true;
    }

    return false;
  }
};

const updateVisible = (value) => {
  visible.value = value;
};

const setShowTip = () => {
  validate.value = true;
  if (formState.value.amount === '' || !formState.value.date) return;
  if (formState.value.type == 2 || (props.itemDate && props.itemDate.type == 2)) {
    formState.value.change = 2;
    tipsVisible.value = true;
  } else {
    save();
  }
};

const save = () => {
  validate.value = true;
  if (formState.value.amount === '' || !formState.value.date) return;

  let params = { ...formState.value, apply_uuid: props.uuid };
  const ajaxFn = props.itemId ? projectVariationAddf : addf;
  if (props.itemId) {
    params.variation_id = props.itemId;
  }

  loading.value = true;
  ajaxFn(params)
    .then((res) => {
      message.success(t('保存成功'));
      emits('update');
      tipsVisible.value = false;
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const init = () => {
  formState.value.date = '';
  formState.value.amount = '';
  formState.value.note = '';

  if (props.itemDate) {
    formState.value = cloneDeep({
      ...formState.value,
      type: props.itemDate.type,
      id: props.itemDate.id,
      date: props.itemDate.date,
      note: props.itemDate.note,
      amount: Math.abs(props.itemDate.amount)
    });
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
