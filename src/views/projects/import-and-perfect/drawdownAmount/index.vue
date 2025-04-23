<template>
  <!-- 错误弹窗 -->
  <vco-confirm-alert :confirm-txt="errorTxt" :show-close="true" v-model:visible="errorVisible"></vco-confirm-alert>

  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="600" :open="visible" :title="t('提取金额') + ' ($' + detail?.amount + ')'" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <ProgressPayment :visible="visible" :validate="validate" :data="formState" :total="detail?.amount" @change="updateformState"></ProgressPayment>

        <div class="flex justify-center">
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
import tool, { numberStrFormat } from '@/utils/tool';
import { darwdownLogSave, darwdownLogChange } from '@/api/project/tools';
import ProgressPayment from './progressPayment.vue';
import { cloneDeep } from 'lodash';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  uuid: {
    type: String
  },
  detail: {
    type: Object
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const errorTxt = ref('');
const errorVisible = ref(false);

const updateVisible = (value) => {
  visible.value = value;
};

const formState = ref({
  build_money: '',
  other_money: 0,
  other_note: '',
  build__data: []
});

const updateformState = (val) => {
  formState.value = { ...formState.value, ...val };
};
const save = () => {
  validate.value = true;
  const conTotal = tool.plus(formState.value.build_money || 0, formState.value.other_money || 0);
  if (conTotal != tool.plus(detail.value.amount || 0, 0)) {
    // message.error(t('金额不匹配'));
    const diffNum = tool.minus(detail.value.amount, conTotal);
    errorTxt.value = t(`放款金额为：<span>{0}</span>，设置金额为：<span>{1}</span>，相差：<span>{2}</span>`, [`$${numberStrFormat(detail.value.amount)}`, `$${numberStrFormat(conTotal)}`, `$${numberStrFormat(diffNum)}`]);
    errorVisible.value = true;

    return;
  }
  loading.value = true;
  let params = {
    uuid: props.uuid,
    id: detail.value.id,
    ...formState.value
  };

  let ajaxFn = isEdit.value ? darwdownLogChange : darwdownLogSave;
  ajaxFn(params)
    .then((res) => {
      message.success(t('保存成功'));
      emits('change');
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
      loading.value = false;
    });
};

const detail = ref({});
const isEdit = ref(false);
const init = (val) => {
  detail.value = val;
  isEdit.value = tool.plus(val.build_money || 0, val.other_money || 0) > 0;
  Object.keys(formState.value).forEach((key) => {
    formState.value[key] = detail.value[key] || formState.value[key];
  });
  if (detail.value?.buildlog) {
    formState.value.build__data = detail.value?.buildlog;
  }
  // formState.value = {
  //   build_money: '',
  //   other_money: 0,
  //   other_note: '',
  //   build__data: []
  // };
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
