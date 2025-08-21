<template>
  <div>
    <div class="inline" @click="init"><slot></slot></div>
    <div @click.stop ref="JournalRef" class="Journal">
      <a-modal :width="550" :open="visible" :title="formState?.id ? t('编辑投资') : t('创建投资')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
        <div class="content sys-form-content">
          <div class="flex" style="justify-content: center">
            <vco-upload-image v-model:value="formState.logo" text="Logo" :isAvatar="true"></vco-upload-image>
          </div>
          <div class="input-item">
            <div class="label" :class="{ err: !formState.name && validate }">{{ t('名称') }}</div>
            <a-input v-model:value="formState.name" />
          </div>
          <div class="input-item">
            <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
            <a-date-picker class="datePicker" inputReadOnly v-model:value="formState.start_date" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" placeholder="" :showToday="false" />
          </div>

          <div class="input-item">
            <div class="label" :class="{ err: !formState.amount && validate }">{{ t('金额，新西兰元') }}</div>
            <a-input-number
              v-model:value="formState.amount"
              :min="0"
              :max="99999999999"
              :disabled="Boolean(formState?.id)"
              :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
              :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
            />
          </div>

          <div class="flex gap-5">
            <div class="input-item">
              <div class="label" :class="{ err: !formState.rate && validate }">{{ t('利率') }}</div>
              <a-input-number class="rate" v-model:value="formState.rate" addon-after="%" :min="0" :max="100" style="width: 100%"></a-input-number>
            </div>
            <div class="input-item">
              <div class="label">{{ t('浮动利率') }}</div>
              <a-input-number class="rate" v-model:value="formState.frate" addon-after="%" :min="0" :max="100" style="width: 100%"></a-input-number>
            </div>
            <div class="input-item">
              <div class="label" :class="{ err: !formState.lrate && validate }">{{ t('Line Fee 费率') }}</div>
              <a-input-number class="rate" v-model:value="formState.lrate" addon-after="%" :min="0" :max="100" style="width: 100%"></a-input-number>
            </div>
          </div>

          <div class="input-item">
            <div class="label">{{ t('备注') }}</div>
            <a-textarea v-model:value="formState.remark" :rows="4" />
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
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { selectDateFormat } from '@/utils/tool';
import { message } from 'ant-design-vue/es';
import { investEdit } from '@/api/invest/index';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  logo: '',
  name: '',
  start_date: '',
  amount: '',
  rate: '',
  frate: 0,
  lrate: '',
  remark: ''
});

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

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (!formState.value.name || formState.value.amount <= 0 || !formState.value.start_date || !formState.value.rate || !formState.value.lrate) {
    return;
  }
  loading.value = true;
  let params = {
    ...formState.value
  };
  investEdit(params)
    .then((res) => {
      emits('update');
      message.success(t('保存成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const init = (val) => {
  validate.value = false;
  if (val) {
    formState.value = {
      ...val
    };
  } else {
    formState.value = {
      logo: '',
      name: '',
      start_date: '',
      amount: '',
      rate: '',
      frate: 0,
      lrate: '',
      remark: ''
    };
  }
  visible.value = true;
};

// 暴露方法给父组件
defineExpose({
  init
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

  .edit {
    font-size: 25px;
    padding-left: 10px;
    color: #333;
  }
}
</style>
