<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal
      :width="700"
      :open="visible"
      :title="t('还款申请')"
      :getContainer="() => $refs.drawdownRequestRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <a-form
          ref="formRef"
          layout="vertical"
          :model="formState"
          :rules="formRules"
        >
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item :label="t('还款标题')" name="name">
                <a-input v-model:value="formState.name" />
              </a-form-item>
              <a-form-item :label="t('还款金额')" name="apply_amount">
                <a-input-number
                  v-model:value="formState.apply_amount"
                  :max="99999999999"
                  :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                  :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item :label="t('还款说明')" name="note">
                <a-textarea v-model:value="formState.note" :placeholder="t('请输入')" :rows="6" class="textarea" />
              </a-form-item>
            </a-col>
            <a-col :span="24">
              <documents-upload v-model:value="document">
                <div class="upload-title">{{ t('文件') }}</div>
              </documents-upload>
            </a-col>
          </a-row>
        </a-form>
        
        <div class="flex justify-center mt-5">
          <a-button @click="save" type="dark" class="save big uppercase shadow bold" :loading="loading">
            {{ t('提交') }}
          </a-button>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script scoped setup>
import { nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { loanRDedit } from '@/api/project/loan';
import DocumentsUpload from './../../../discharge/components/form/DocumentsUpload.vue';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  uuid: {
    type: String
  }
});

const visible = ref(false);
const loading = ref(false);

const formState = ref({
  name: '',
  note: '',
  apply_amount: '',
});

const document = ref([])

const formRef = ref()

const formRules = ref({
  name: [
    { required: true, message: t('请输入') + t('还款标题'), trigger: 'blur' },
  ],
  apply_amount: [
    { required: true, message: t('请输入') + t('还款金额'), trigger: 'blur' },
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
        uuid: props.uuid,
        document: document.value
      }
      loading.value = true

      loanRDedit(params).then(() => {
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
    Object.keys(formState.value).forEach((key) => {
      formState.value[key] = ''; // 清空每个字段
    });
  })
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.drawdown-request {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 40px 40px 24px;
      border-radius: 24px;
      .ant-modal-title {
        font-size: 20px;
        font-weight: 500;
      }
    }
    padding: 0px !important;

    .content {
      line-height: 1.33;
      padding: 24px 40px 40px;
      .save {
        margin-top: 24px;
      }
    }
  }
}

.sys-form-content {
  :deep(.textarea) {
    height: 154px !important;
  }
}
</style>
