<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="486" :open="visible" :title="t('接受请求')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.type && validate }">{{ t('类型') }}</div>
          <a-select style="width: 100%" v-model:value="formState.type" show-search :options="options" @change="loadType"></a-select>
        </div>
        <template v-if="formState.type == 2">
          <div class="input-item">
            <div class="label" :class="{ err: !formState.bank_type && validate }">{{ t('类型') }}</div>
            <a-select style="width: 100%" v-model:value="formState.bank_type" show-search :options="types" :fieldNames="{ label: 'name', value: 'code' }"></a-select>
          </div>
          <div class="input-item">
            <div class="label" :class="{ err: !formState.bank_no && validate }">{{ t('单号') }}</div>
            <a-input v-model:value="formState.bank_no" />
          </div>
        </template>
        <div class="input-item">
          <div class="label">{{ t('说明') }}</div>
          <a-textarea v-model:value="formState.remark" placeholder="Basic usage" :rows="4" />
        </div>
        <div class="flex justify-center">
          <a-button @click="save" type="dark" class="save big uppercase" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { doReconcile } from '@/api/reconciliations';
import { systemDictData } from '@/api/system';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  apply_id: {
    type: [String, Number]
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const options = ref([
  {
    label: t('不对账'),
    value: 1
  },
  {
    label: t('对账'),
    value: 2
  }
]);
const types = ref([]);

const formState = ref({
  apply_id: '',
  type: 1,
  bank_type: '',
  bank_no: '',
  remark: ''
});

const updateVisible = (value) => {
  visible.value = value;
};

const loading_type = ref(false);

const loadType = () => {
  formState.value.bank_type = '';
  formState.value.bank_no = '';
  if (types.value.length) {
    return;
  }
  loading_type.value = true;
  systemDictData('reconciliation_system')
    .then((res) => {
      types.value = res;
    })
    .finally((_) => {
      loading_type.value = false;
    });
};
const save = () => {
  formState.value.apply_id = props.apply_id;
  validate.value = true;
  if (formState.value.type == 2 && (!formState.value.bank_type || !formState.value.bank_no)) {
    return;
  }
  loading.value = true;
  doReconcile(formState.value)
    .then((res) => {
      message.success(t('提交成功'));
      emits('update');
      updateVisible(false);
    })
    .finally((_) => {
      validate.value = false;
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
