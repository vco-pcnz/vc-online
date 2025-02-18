<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="DrawdownBack" class="DrawdownBack">
    <a-modal :width="486" :open="visible" :title="t('退回请求')" :getContainer="() => $refs.DrawdownBack" :maskClosable="false" :footer="false" @cancel="updateVisible(false)">
      <div class="content sys-form-content">
        <a-form
          ref="formRef"
          layout="vertical"
          :model="formState"
          :rules="formRules"
        >
          <a-form-item :label="t('退回原因')" name="cancel_reason">
            <a-textarea v-model:value="formState.cancel_reason" :rows="6" />
          </a-form-item>
        </a-form>

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
import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { dischargeGoback } from '@/api/project/loan';

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

const formState = ref({
  cancel_reason: '',
});

const formRef = ref()
const formRules = ref({
  cancel_reason: [
    { required: true, message: t('请输入') + t('退回原因'), trigger: 'blur' },
  ]
});

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  formRef.value
    .validate()
    .then(() => {
      const params = {
        ...formState.value,
        p_uuid: props.uuid,
        uuid: props.detail.uuid
      }
      loading.value = true

      dischargeGoback(params).then(() => {
        loading.value = false
        visible.value = false
        emits('change')
      }).catch(() => {
        loading.value = false
      })
    })
    .catch((error) => {
      console.log('error', error);
    });
};

const init = () => {
  visible.value = true;

  nextTick(() => {
    formRef.value.clearValidate();
    formRef.value.resetFields();
    formState.value.cancel_reason = ''
  })
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';
.DrawdownBackTitle {
  text-align: center;
  margin-top: 10px;
  font-size: @fs_xs;
  .back {
    color: #df622b;
    cursor: pointer;
  }
}
.DrawdownBack {
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
