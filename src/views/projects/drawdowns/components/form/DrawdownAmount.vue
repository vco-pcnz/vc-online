<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal
      :width="486"
      :open="visible"
      :title="t('提取金额')"
      :getContainer="() => $refs.JournalRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.amount && validate }">Approved amount (requested $1,222.00)</div>
          <a-input-number
            v-model:value="formState.amount"
            :max="99999999999"
            :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
          />
        </div>

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
import { frename } from '@/api/project/annex';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  formParams: {
    type: Object,
    default: ''
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  amount: '',
  review: ''
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
