<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="550" :open="visible" :title="t('默认开始')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <div class="input-item">
          <div class="label" :class="{ err: !formState.end_date && validate }">{{ t('开始日期') }}</div>
          <a-date-picker class="datePicker" inputReadOnly v-model:value="formState.end_date" format="DD/MM/YYYY" valueFormat="YYYY-MM-DD" :showToday="false" />
        </div>
        <div class="input-item">
          <div class="label">{{ t('描述') }}</div>
          <a-textarea v-model:value="formState.note2" placeholder="Basic usage" :rows="6" />
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
import { eedit } from '@/api/project/penalty';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  uuid: {
    type: String,
    default: ''
  },
  id: {
    type: String,
    default: ''
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  uuid: '',
  id: '',
  end_date: '',
  note2: ''
});

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  formState.value.uuid = props.uuid;
  formState.value.id = props.id;
  validate.value = true;
  if (!formState.value.end_date) return;
  eedit(formState.value)
    .then((res) => {
      emits('update');
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
