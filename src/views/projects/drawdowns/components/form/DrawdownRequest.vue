<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal
      :width="850"
      :open="visible"
      v-if="visible"
      title="Drawdown request"
      :getContainer="() => $refs.drawdownRequestRef"
      :maskClosable="false"
      :footer="false"
      @cancel="updateVisible(false)"
    >
      <div class="content sys-form-content">
        <a-row :gutter="24">
          <a-col :span="12">
            <div class="input-item">
              <div class="label" :class="{ err: !formState.name && validate }">Drawdown title</div>
              <a-input v-model:value="formState.name" />
            </div>
            <div class="input-item" style="margin-top: 16px">
              <div class="label" :class="{ err: !formState.apply_amount && validate }">Requested amount, $ nzd</div>
              <a-input-number
                v-model:value="formState.apply_amount"
                :max="99999999999"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="input-item">
              <div class="label">Notes</div>
              <a-textarea v-model:value="formState.note" :rows="6" />
            </div>
          </a-col>
        </a-row>
        <p class="my-5 bold fs_xl">Documents</p>
        <p class="label" style="margin-top: -15px; opacity: 0" :class="{ err: !formState.d_file.length && validate }">
          Provide at least one of these documents
        </p>

        <template v-for="item in formModal2" :key="item.id">
          <documents-upload v-if="!item.children" v-model:value="item['files']">
            <div class="upload-title">
              <i class="iconfont">&#xe795;</i>
              <span class="name">{{ item.name }}</span>
            </div>
          </documents-upload>
        </template>

        <div class="upload-title">
          <i class="iconfont">&#xe795;</i>
          <span class="name">Certificates</span>
        </div>
        <template v-for="item in formModal3" :key="item.id">
          <documents-upload v-model:visible="item.check" v-model:value="item['files']">
            <div class="checkbox-item">
              <a-checkbox v-model:checked="item.check"> {{ item.name }}</a-checkbox>
            </div>
          </documents-upload>
        </template>

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
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { annexSel } from '@/api/project/annex';
import { loanDedit } from '@/api/project/loan';
import DocumentsUpload from './DocumentsUpload.vue';

const { t } = useI18n();
const emits = defineEmits(['change']);

const props = defineProps({
  uuid: {
    type: String
  }
});

const visible = ref(false);
const loading = ref(false);
const validate = ref(false);
const formModal2 = ref([]);
const formModal3 = ref([]);
const documents = ref({});

const formState = ref({
  uuid: '',
  name: '',
  note: '',
  apply_amount: '',
  p_file: [],
  d_file: []
});

const updateVisible = (value) => {
  visible.value = value;
};

const save = () => {
  validate.value = true;
  formState.value.uuid = props.uuid;
  formState.value.d_file = formModal2.value.filter((item) => {
    return item.files && item.files.length;
  });
  formState.value.p_file = formModal3.value.filter((item) => {
    return item.files && item.files.length;
  });

  if (!formState.value.name || !formState.value.apply_amount || !formState.value.d_file.length) return;
  loading.value = true;
  loanDedit(formState.value)
    .then((res) => {
      visible.value = false;
      validate.value = false;
      emits('change');
      message.success(t('提交成功'));
    })
    .finally((_) => {
      loading.value = false;
    });
};

const init = () => {
  formState.value.name = '';
  formState.value.note = '';
  formState.value.apply_amount = '';
  formState.value.d_file = [];
  formState.value.p_file = [];
  annexSel({ apply_uuid: props.uuid, type: 2 }).then((res) => {
    formModal2.value = res;
  });
  annexSel({ apply_uuid: props.uuid, type: 3 }).then((res) => {
    if (res && res.length) {
      res.map((item) => {
        item['check'] = false;
      });
    }
    formModal3.value = res;
  });
  visible.value = true;
};
</script>
<style scoped lang="less">
@import '@/styles/variables.less';

.drawdown-request {
  :deep(.ant-modal-content) {
    .ant-modal-header {
      padding: 72px 84px 24px;
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
          opacity: 1 !important;
        }
      }

      .save {
        margin-top: 24px;
      }
    }
  }

  .upload-title {
    align-items: center;
    border-bottom: 1px solid #e2e5e2;
    margin-bottom: 8px;
    padding-bottom: 12px;
    padding-top: 8px;
    .iconfont {
      font-size: 18px;
    }

    .name {
      font-weight: 600;
      margin-left: 10px;
    }
  }

  .checkbox-item {
    margin-bottom: 8px;
    padding-bottom: 12px;
    padding-top: 8px;
  }
}
</style>
