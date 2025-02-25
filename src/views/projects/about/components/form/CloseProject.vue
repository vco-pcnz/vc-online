<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal
      :width="550"
      :open="visible"
      :title="t('拟关闭')"
      :getContainer="() => $refs.JournalRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.date && validate }">{{ t('日期') }}</div>
          <a-date-picker
            class="datePicker"
            inputReadOnly
            v-model:value="formState.date"
            :format="selectDateFormat()"
            valueFormat="YYYY-MM-DD"
            :showToday="false"
            :disabledDate="disabledDateFormat"
          />
        </div>
        <div class="input-item">
          <div class="label">{{ t('说明') }}</div>
          <a-textarea v-model:value="formState.close_note" :rows="5" />
        </div>

        <div class="flex justify-center">
          <a-button @click="confirm" type="dark" class="save big uppercase" :loading="loading">
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
import { projectDetailClose } from '@/api/project/project';
import { selectDateFormat } from '@/utils/tool';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  formParams: {
    type: Object,
    default: {},
  },
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  date: '',
  close_note: '',
});

const updateVisible = (value) => {
  visible.value = value;
};

const disabledDateFormat = (current) => {
  const endDate = new Date();
  if (current && current.isBefore(endDate, 'day')) {
    return true;
  }

  return false;
};
const confirm = () => {
  validate.value = true;
  if (!formState.value.date) return message.error(t('请输入') + t('日期'));
  loading.value = true;
  let params = {
    ...formState.value,
    ...props.formParams,
  };

  projectDetailClose(params)
    .then((res) => {
      emits('update');
      formState.value.date = '';
      message.success(t('提交成功'));
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
