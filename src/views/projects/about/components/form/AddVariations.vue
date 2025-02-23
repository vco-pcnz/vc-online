<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal
      :width="900"
      :open="visible"
      :title="t('变更请求')"
      :getContainer="() => $refs.JournalRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <a-row :gutter="24" class="mb-7">
          <a-col :span="16">
            <div class="label" :class="{ err: !formState.type && validate }">{{ t('变更类型') }}</div>
            <a-select
              style="width: 100%"
              v-model:value="formState.type"
              show-search
              :options="types"
              :filter-option="customFilter"
              @change="(val) => handleChange(1, val)"
            ></a-select>
          </a-col>
          <a-col :span="8">
            <div class="label" :class="{ err: !formState.amount && validate }">{{ t('增加金额') }}</div>
            <a-input-number
              v-model:value="formState.amount"
              :max="99999999999"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-col>
        </a-row>

        <a-row :gutter="24" class="mb-7">
          <a-col :span="8">
            <div class="label" :class="{ err: !formState.start && validate }">{{ t('变更开始日期') }}</div>
            <a-date-picker
              class="datePicker"
              inputReadOnly
              :open="isOpen"
              v-model:value="formState.start"
              :format="selectDateFormat()"
              valueFormat="YYYY-MM-DD"
              :showToday="false"
            />
          </a-col>
          <a-col :span="8">
            <div class="label" :class="{ err: !formState.end && validate }">{{ t('变更到期日') }}</div>
            <a-date-picker
              class="datePicker"
              inputReadOnly
              :open="isOpen"
              v-model:value="formState.end"
              :format="selectDateFormat()"
              valueFormat="YYYY-MM-DD"
              :showToday="false"
            />
          </a-col>
          <a-col :span="8">
            <div class="label">{{ t('初始回撤') }}</div>
            <a-input-number
              v-model:value="formState.drawdown"
              :max="99999999999"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-col>
        </a-row>

        <a-row :gutter="24" class="mb-7">
          <a-col :span="4">
            <div class="label" :class="{ err: !formState.interestRate && validate }">{{ t('利率') }}</div>
            <a-input-number
              v-model:value="formState.interestRate"
              :min="0"
              :max="100"
              :formatter="(value) => `${value}%`"
              :parser="(value) => value.replace('%', '')"
            />
          </a-col>
          <a-col :span="4">
            <div class="label" :class="{ err: !formState.estabRate && validate }">{{ t('建立速率') }}</div>
            <a-input-number
              v-model:value="formState.estabRate"
              :min="0"
              :max="100"
              :formatter="(value) => `${value}%`"
              :parser="(value) => value.replace('%', '')"
            />
          </a-col>
          <a-col :span="4">
            <div class="label">{{ t('线路资费标准(M)') }}</div>
            <a-input-number
              v-model:value="formState.lineFeeRate"
              :min="0"
              :max="100"
              :formatter="(value) => `${value}%`"
              :parser="(value) => value.replace('%', '')"
            />
          </a-col>

          <a-col :span="4">
            <div class="label">{{ t('律师费') }}</div>
            <a-input-number
              v-model:value="formState.legalFee"
              :max="99999999999"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-col>
          <a-col :span="4">
            <div class="label">{{ t('经纪费') }}</div>
            <a-input-number
              v-model:value="formState.brokerFee"
              :max="99999999999"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-col>
          <a-col :span="4">
            <div class="label">{{ t('其他费用') }}</div>
            <a-input-number
              v-model:value="formState.otherFee"
              :max="99999999999"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="24">
            <div class="label" :class="{ err: !formState.comments && validate }">{{ t('评论') }}</div>
            <a-textarea v-model:value="formState.comments" :rows="6" />
          </a-col>
        </a-row>
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

const types = ref([
  { label: 'Journal Credit', value: 1 },
  { label: 'Journal Debit', value: 2 },
  { label: 'Journal Default Interest Credit', value: 3 }
]);

const customFilter = (input, option) => {
  // 根据自定义字段名 'name' 进行筛选
  return option.label.toLowerCase().includes(input.toLowerCase());
};

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  type: '',
  amount: '',
  start: '',
  end: '',
  drawdown: 0,
  interestRate: 0,
  estabRate: 0,
  lineFeeRate: 0,
  legalFee: 0,
  brokerFee: 0,
  brokerFee: 0,
  otherFee: 0,
  comments: ''
});

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
  validate.value = false;
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
