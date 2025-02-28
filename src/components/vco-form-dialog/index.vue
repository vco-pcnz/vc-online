<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="JournalRef" class="Journal">
    <a-modal :width="550" :open="visible" :title="title" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <template v-for="(item, index) in initData" :key="index">
          <div class="input-item">
            <div class="label" :class="{ err: !formState[item.key] && validate && item.required }">{{ t(item.label) }}</div>
            <template v-if="item.type === 'date'">
              <a-date-picker class="datePicker" inputReadOnly v-model:value="formState[item.key]" :format="selectDateFormat()" valueFormat="YYYY-MM-DD" :showToday="false" :disabledDate="item.disabledDate" />
            </template>
            <template v-if="item.type === 'textarea'"> <a-textarea v-model:value="formState[item.key]" :rows="5" /> </template>
          </div>
        </template>
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
import { selectDateFormat } from '@/utils/tool';
import { request } from '@/utils/request';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  title: {
    type: String
  },
  url: {
    type: String,
    default: ''
  },
  formParams: {
    type: Object,
    default: {}
  },
  initData: {
    type: Array,
    default: () => {
      return [
        {
          type: 'textarea',
          label: '原因',
          key: 'decline_reason',
          required: true
        }
      ];
    }
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({});

const updateVisible = (value) => {
  visible.value = value;
};

const confirm = () => {
  validate.value = true;
  let keys = props.initData.filter((item) => !item.hide).map((item) => item.key);
  let requiredKeys = props.initData.filter((item) => !item.hide && item.required).map((item) => item.key);
  let formRequiredKeys = requiredKeys.filter((item) => formState.value[item]);
  if (requiredKeys.length != formRequiredKeys.length) return;
  keys.map((item) => {
    if (!formState.value[item]) {
      formState.value[item] = '';
    }
  });
  loading.value = true;
  let params = {
    ...formState.value,
    ...props.formParams
  };
  const paramsInfo = {
    url: props.url,
    method: 'post',
    data: params
  };
  request(paramsInfo)
    .then((res) => {
      emits('update');
      message.success(t('操作成功'));
      updateVisible(false);
    })
    .finally((_) => {
      loading.value = false;
    });
};

const init = () => {
  formState.value = {};
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
