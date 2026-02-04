<template>
  <div class="inline" @click="init">
    <a-tooltip placement="top">
      <template #title> Export transaction details for all loans under filter conditions </template>
      <slot>
        <a-button type="cyan" size="small" class="ml-3" shape="round" :loading="loading">{{ t('明细表') }}</a-button>
      </slot>
    </a-tooltip>
  </div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="486" :open="visible" title=" " :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form ref="formRef" layout="vertical" :model="formState" :rules="formRules">
          <a-form-item :label="t('交易类型')">
            <a-select :loading="loading_type" style="width: 100%" v-model:value="formState.transaction_type" show-search :options="transaction_type.duration.concat(transaction_type.journal_type)" :filter-option="customFilter" :fieldNames="{ label: 'name', value: 'code' }"></a-select>
          </a-form-item>
          <a-form-item :label="t('日期')" name="date">
            <a-range-picker class="datePicker" :disabledDate="disabledDateFormat" inputReadOnly v-model:value="formState.date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" />
          </a-form-item>
        </a-form>

        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('导出') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { downSc } from '@/api/project/project';
import dayjs from 'dayjs';
import { selectDateFormat } from '@/utils/tool';
import useProductStore from '@/store/modules/product';
const productStore = useProductStore();
import { systemDictData } from '@/api/system';
import { fill } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  searchParams: {
    type: Object
  },
  sta: {
    type: [String, Number]
  }
});

const visible = ref(false);
const loading = ref(false);

const formState = ref({
  date: '',
  transaction_type:''
});

const formRef = ref();
const formRules = ref({
  date: [{ required: true, message: t('请选择') + t('日期'), trigger: 'change' }]
});

const disabledDateFormat = (current) => {
  const endDate = dayjs();

  if (current && current.isAfter(endDate, 'day')) {
    return true;
  }

  return false;
};

const updateVisible = (value) => {
  visible.value = value;
};


const transaction_type = ref({
  duration: [],
  journal_type: []
});

const loading_type = ref(false);
const loadType = (key) => {
  loading_type.value = true;
  systemDictData(key)
    .then((res) => {
      transaction_type.value[key] = res;
    })
    .finally((_) => {
      loading_type.value = false;
    });
};

const customFilter = (input, option) => {
  // 根据自定义字段名 'name' 进行筛选
  return option.name.toLowerCase().includes(input.toLowerCase());
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = {
        ...props.searchParams,
        sta: props.sta,
        schedule_s: formState.value.date[0],
        schedule_e: formState.value.date[1],
        fee_type: formState.value.transaction_type,
        product_uuid: productStore.currentProduct
      };
      loading.value = true;

      downSc(params)
        .then((res) => {
          window.open(res);
          loading.value = false;
          visible.value = false;
          emits('change');
        })
        .catch(() => {
          loading.value = false;
        });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const init = () => {
  visible.value = true;
  formState.value.date = '';
  formState.value.transaction_type = '';
  nextTick(() => {
    formRef.value.clearValidate();
    formRef.value.resetFields();
  });
  loadType('duration');
  loadType('journal_type');
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.Journal {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 32px 84px 0px;
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
