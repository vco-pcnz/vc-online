<template>
  <div class="inline" @click="init"><slot></slot></div>
  <div @click.stop ref="drawdownRequestRef" class="drawdown-request">
    <a-modal
      :width="850"
      :open="visible"
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
              <div class="label" :class="{ err: !formState.amount && validate }">Requested amount, $ nzd</div>
              <a-input-number
                v-model:value="formState.amount"
                :max="99999999999"
                :formatter="(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
              />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="input-item">
              <div class="label">Notes</div>
              <a-textarea v-model:value="formState.notes" placeholder="Basic usage" :rows="6" />
            </div>
          </a-col>
        </a-row>
        <p class="my-5 bold fs_xl">Documents</p>

        <template v-for="(item, index) in formModal" :key="index">
          <documents-upload v-if="!item.children" v-model:value="formState[item.key]">
            <div class="upload-title">
              <i class="iconfont">&#xe795;</i>
              <span class="name">{{ item.name }}</span>
            </div>
          </documents-upload>
          <template v-else>
            <div class="upload-title">
              <i class="iconfont">&#xe795;</i>
              <span class="name">Certificates</span>
            </div>
            <template v-for="sub in item.children" :key="sub.key">
              <documents-upload v-model:visible="sub.check" v-model:value="formState[sub.key]">
                <div class="checkbox-item">
                  <a-checkbox v-model:checked="sub.check"> {{ sub.name }}</a-checkbox>
                </div>
              </documents-upload>
            </template>
          </template>
        </template>

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
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue/es';
import { frename } from '@/api/project/annex';
import DocumentsUpload from './DocumentsUpload.vue';

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
const rename = ref('');

const formState = ref({
  name: '',
  notes: '',
  amount: ''
});

const formModal = ref([
  { name: 'Drawdown notice', key: 'drawdownNotice' },
  { name: 'Invoices', key: 'invoices' },
  { name: 'Photos', key: 'photos' },
  {
    name: 'Certificates',
    key: 'certificates',
    children: [
      { name: 'Building inspections', key: 'BuildingInspections', check: false },
      { name: 'Engineer reports', key: 'Engineer', check: false },
      { name: 'Utility certification & compliance', key: 'Utility', check: false },
      { name: 'QS reports', key: 'QS', check: false },
      { name: 'CCC & titles', key: 'CCC', check: false },
      { name: 'Pre-sales', key: 'Pre', check: false }
    ]
  }
]);

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
