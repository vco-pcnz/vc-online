<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="550" :open="visible" :title="t('平账')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.cate && validate }">Journal or Duration</div>
          <a-select style="width: 100%" v-model:value="formState.cate" :options="types" @change="loadType"></a-select>
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.type && validate }">{{ t('类型') }}</div>
          <a-select v-if="formState.cate == 1" :loading="loading_type" style="width: 100%" v-model:value="formState.type" show-search :options="journal_type" :filter-option="customFilter" :fieldNames="{ label: 'name', value: 'code' }"></a-select>
          <a-select v-if="formState.cate == 2" :loading="loading_type" style="width: 100%" v-model:value="formState.type" show-search :options="duration_type" :filter-option="customFilter" :fieldNames="{ label: 'name', value: 'code' }"></a-select>
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.addsub && validate }">{{ t('方法') }}</div>
          <a-select style="width: 100%" v-model:value="formState.addsub" show-search :options="addsubs"></a-select>
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
          <a-date-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly v-model:value="formState.date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" />
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.amount && validate }">{{ t('金额，新西兰元') }}</div>
          <a-input-number v-model:value="formState.amount" min="0" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.note && validate }">{{ t('声明说明') }}</div>
          <a-input v-model:value="formState.note" />
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.remark && validate }">{{ t('审阅意见') }}</div>
          <a-textarea v-model:value="formState.remark" placeholder="Basic usage" :rows="4" />
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
import { selectDateFormat } from '@/utils/tool';
import { systemDictData } from '@/api/system';
import { edit } from '@/api/project/journal';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  currentId: {
    type: String,
    default: ''
  },
  detail: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const rename = ref('');

const journal_type = ref([]);
const duration_type = ref([]);
const types = ref([
  {
    label: t('Journal'),
    value: 1
  },
  {
    label: t('Duration'),
    value: 2
  }
]);

const addsubs = ref([
  {
    label: t('增加'),
    value: 1
  },
  {
    label: t('减少'),
    value: 2
  }
]);

const formState = ref({
  uuid: '',
  cate: 1,
  type: '',
  addsub: '',
  date: '',
  amount: '',
  note: '',
  remark: ''
});

const customFilter = (input, option) => {
  // 根据自定义字段名 'name' 进行筛选
  return option.name.toLowerCase().includes(input.toLowerCase());
};

const updateVisible = (value) => {
  visible.value = value;
};

const disabledDateFormat = (current) => {
  const startDate = props.detail?.date.start_date;
  if (current && current.isBefore(startDate, 'day')) {
    return true;
  }

  return false;
};

const save = () => {
  validate.value = true;
  formState.value.uuid = props.currentId;
  if (Object.values(formState.value).some((value) => value === '')) {
    return;
  }
  loading.value = true;
  edit(formState.value)
    .then((res) => {
      emits('update');
      rename.value = '';
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const loading_type = ref(false);
const loadType = () => {
  formState.value.type = '';
  if ((formState.value.cate == 1 && journal_type.value.length) || (formState.value.cate == 2 && duration_type.value.length)) {
    return;
  }
  loading_type.value = true;
  systemDictData(formState.value.cate == 1 ? 'journal_type' : 'duration')
    .then((res) => {
      if (formState.value.cate == 1) {
        journal_type.value = res;
      }
      if (formState.value.cate == 2) {
        duration_type.value = res;
      }
    })
    .finally((_) => {
      loading_type.value = false;
    });
};

const init = () => {
  validate.value = false;
  formState.value = {
    uuid: '',
    cate: 1,
    type: '',
    addsub: '',
    date: '',
    amount: '',
    note: '',
    remark: ''
  };
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
