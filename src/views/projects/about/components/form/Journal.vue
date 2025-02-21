<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal
      :width="550"
      :open="visible"
      :title="t('日志')"
      :getContainer="() => $refs.JournalRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.type && validate }">{{ t('类型') }}</div>
          <a-select
            style="width: 100%"
            v-model:value="formState.type"
            show-search
            :options="types"
            :filter-option="customFilter"
          ></a-select>
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
          <a-date-picker
            class="datePicker"
            inputReadOnly
            :open="isOpen"
            v-model:value="formState.date"
            :format="selectDateFormat()"
            valueFormat="YYYY-MM-DD"
            :showToday="false"
          />
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.amount && validate }">{{ t('金额，新西兰元') }}</div>
          <a-input-number
            v-model:value="formState.amount"
            :max="99999999999"
            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
          />
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.note && validate }">{{ t('声明说明') }}</div>
          <a-input v-model:value="formState.note" />
        </div>
        <div class="input-item">
          <div class="label" :class="{ err: !formState.review && validate }">{{ t('审阅意见') }}</div>
          <a-textarea v-model:value="formState.review" placeholder="Basic usage" :rows="4" />
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
import { frename } from '@/api/project/annex';
import { selectDateFormat } from "@/utils/tool"

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  formParams: {
    type: Object,
    default: {}
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const rename = ref('');

const types = ref([
  { label: 'Journal Credit', value: 1 },
  { label: 'Journal Debit', value: 2 },
  { label: 'Journal Default Interest Credit', value: 3 }
]);

const formState = ref({
  type: '',
  date: '',
  amount: '',
  note: '',
  review: ''
});

const customFilter = (input, option) => {
  // 根据自定义字段名 'name' 进行筛选
  return option.name.toLowerCase().includes(input.toLowerCase());
};

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  console.log(formState.value);

  return;
  if (!rename.value) return message.error(t('请输入') + t('名称'));
  loading.value = true;
  let params = {
    ...props.formParams,
    name: rename.value
  };
  frename(params)
    .then((res) => {
      emits('change');
      rename.value = '';
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const init = () => {
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
