<template>
  <div>
    <div class="inline" @click="init"><slot></slot></div>
    <div @click.stop ref="JournalRef" class="Journal">
      <a-modal :width="550" :open="visible" :title="t('编辑金额')" :getContainer="() => $refs.JournalRef" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
        <div class="content sys-form-content">
          <div class="flex">
            <div class="input-item">
              <div class="label">{{ t('方法') }}</div>
              <a-select style="width: 120px" class="mr-3" v-model:value="formState.type" show-search :options="types"></a-select>
            </div>
            <div class="input-item" style="flex: 1">
              <div class="label" :class="{ err: !formState.amount && validate }">{{ t('金额') }}</div>
              <a-input-number v-model:value="formState.amount" :min="0" :max="99999999999" :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')" :parser="(value) => value.replace(/\$\s?|(,*)/g, '')" />
            </div>
          </div>
          <div class="input-item">
            <div class="label">{{ t('备注') }}</div>
            <a-textarea v-model:value="formState.remark" :rows="4" />
          </div>

          <div class="flex justify-end items-end mt-5">
            <div>
              <div class="fs_md">{{ tool.formatMoney(data.amount || 0) }}</div>
            </div>
            <div class="operator" v-if="formState.type == 0">+</div>
            <div class="operator" v-if="formState.type == 1">-</div>
            <div>
              <div class="fs_md">{{ tool.formatMoney(formState.amount || 0) }}</div>
            </div>
            <div class="operator">=</div>
            <div>
              <div class="fs_md">
                <template v-if="formState.type == 0">
                  {{ tool.formatMoney(tool.plus(data.amount || 0, formState.amount || 0)) }}
                </template>
                <template v-if="formState.type == 1">
                  {{ tool.formatMoney(tool.minus(data.amount || 0, formState.amount || 0)) }}
                </template>
              </div>
            </div>
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
import tool from '@/utils/tool';
import { message } from 'ant-design-vue/es';
import { addAmount } from '@/api/invest/index';

const { t } = useI18n();
const emits = defineEmits(['update']);

const props = defineProps({
  data: {
    type: Object,
    default: {}
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);

const formState = ref({
  amount: '',
  type: 0,
  remark: ''
});

const types = ref([
  {
    label: t('增加'),
    value: 0
  },
  {
    label: t('减少'),
    value: 1
  }
]);

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  if (formState.value.amount <= 0) {
    return;
  }
  loading.value = true;
  let params = {
    id: props.data.id,
    ...formState.value
  };
  addAmount(params)
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
  formState.value = {
    amount: '',
    type: 0,
    remark: ''
  };

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
  .operator {
    font-size: 14px;
    margin: 0 10px;
  }
}
</style>
