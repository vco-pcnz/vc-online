<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="800" :open="visible" :title="t('提取金额')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <!-- <div class="input-item">
          <div class="label" :class="{ err: !amount && validate }">Approved amount (requested {{ tool.formatMoney(detail?.amount) }})</div>
          <a-input-number v-model:value="amount" :max="99999999999" :min="0" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
        </div> -->

        <ProgressPayment :visible="visible" :validate="validate" :data="formState" :projectDetail="projectDetail" :isEdit="isEdit" @change="updateformState"></ProgressPayment>

        <div class="flex justify-center" v-if="isEdit">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('保存') }}
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
import { loanDchange } from '@/api/project/loan';
import ProgressPayment from './ProgressPayment.vue';
import { cloneDeep } from 'lodash';

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
  },
  isEdit: {
    type: Boolean,
    default: true
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const amount = ref('');

const updateVisible = (value) => {
  visible.value = value;
};

const formState = ref({
  build_money: '',
  other_money: 0,
  other_note: '',
  other_type: '',
  build__data: []
});

const updateformState = (val) => {
  formState.value = { ...formState.value, ...val };
};
const save = () => {
  validate.value = true;
  if (tool.plus(formState.value.build_money || 0, formState.value.other_money || 0) == 0) return;
  loading.value = true;
  let params = {
    uuid: props.uuid,
    id: props.detail.id,
    ...formState.value
  };
  loanDchange(params)
    .then((res) => {
      amount.value = '';
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
  Object.keys(formState.value).forEach((key) => {
    formState.value[key] = props.detail[key];
  });
  if (props.detail?.buildlog) {
    formState.value.build__data = props.detail?.buildlog;
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
